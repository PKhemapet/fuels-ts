import { generateTestWallet } from '@fuel-ts/wallet/test-utils';
import { readFileSync } from 'fs';
import { toHex, Provider, ContractFactory, BaseAssetId } from 'fuels';
import { join } from 'path';

import abi from '../fixtures/forc-projects/storage-test-contract/out/debug/storage-test-abi.json';
import storageSlots from '../fixtures/forc-projects/storage-test-contract/out/debug/storage-test-storage_slots.json';

const binPath = join(
  __dirname,
  '../fixtures/forc-projects/storage-test-contract/out/debug/storage-test.bin'
);

const setup = async () => {
  const provider = new Provider('http://127.0.0.1:4000/graphql');
  // Create wallet
  const wallet = await generateTestWallet(provider, [[1_000, BaseAssetId]]);

  // Deploy contract
  const bytecode = readFileSync(binPath);
  // #region contract-deployment-storage-slots
  // #context import storageSlots from '../your-sway-project/out/debug/your-sway-project-storage_slots.json';

  const factory = new ContractFactory(bytecode, abi, wallet);
  const contract = await factory.deployContract({
    storageSlots,
  });
  // #endregion contract-deployment-storage-slots

  return contract;
};

describe('StorageTestContract', () => {
  it('can increment counter', async () => {
    const contract = await setup();

    // Call contract
    const { value: initializeResult } = await contract.functions.initialize_counter(1300).call();
    expect(initializeResult.toHex()).toEqual(toHex(1300));
    const { value: incrementResult } = await contract.functions.increment_counter(37).call();
    expect(incrementResult.toHex()).toEqual(toHex(1337));

    const { value: count } = await contract.functions.counter().simulate();
    expect(count.toHex()).toEqual(toHex(1337));
  });

  it('can increment counter - using custom inline storage slots', async () => {
    const provider = new Provider('http://127.0.0.1:4000/graphql');
    const wallet = await generateTestWallet(provider, [[1_000, BaseAssetId]]);
    const bytecode = readFileSync(binPath);
    const factory = new ContractFactory(bytecode, abi, wallet);
    // #region contract-deployment-storage-slots-inline
    const contract = await factory.deployContract({
      storageSlots: [
        {
          key: '02dac99c283f16bc91b74f6942db7f012699a2ad51272b15207b9cc14a70dbae',
          value: '0000000000000001000000000000000000000000000000000000000000000000',
        },
        {
          key: '6294951dcb0a9111a517be5cf4785670ff4e166fb5ab9c33b17e6881b48e964f',
          value: '0000000000000001000000000000003200000000000000000000000000000000',
        },
        {
          key: 'b48b753af346966d0d169c0b2e3234611f65d5cfdb57c7b6e7cd6ca93707bee0',
          value: '000000000000001e000000000000000000000000000000000000000000000000',
        },
        {
          key: 'de9090cb50e71c2588c773487d1da7066d0c719849a7e58dc8b6397a25c567c0',
          value: '0000000000000014000000000000000000000000000000000000000000000000',
        },
        {
          key: 'f383b0ce51358be57daa3b725fe44acdb2d880604e367199080b4379c41bb6ed',
          value: '000000000000000a000000000000000000000000000000000000000000000000',
        },
      ],
    });
    // #endregion contract-deployment-storage-slots-inline
    const { value: initializeResult } = await contract.functions.initialize_counter(1300).call();
    expect(initializeResult.toHex()).toEqual(toHex(1300));
    const { value: incrementResult } = await contract.functions.increment_counter(37).call();
    expect(incrementResult.toHex()).toEqual(toHex(1337));

    const { value: count } = await contract.functions.counter().simulate();
    expect(count.toHex()).toEqual(toHex(1337));
  });
});
