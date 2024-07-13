import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('Omnee Test', function () {
    // Constant representing a mock Endpoint ID for testing purposes
    const eidA = 1
    const eidB = 2
    // Declaration of variables to be used in the test suite
    let OFTFactory: ContractFactory
    let UniversalFactory: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    let uf: Contract
    let baseFactory : Contract
    let oftFactoryB : Contract

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        // We are using a derived contract that exposes a mint() function for testing purposes
        UniversalFactory = await ethers.getContractFactory('UniversalFactory');
        OFTFactory = await ethers.getContractFactory('OFTFactory');

        // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
        const signers = await ethers.getSigners()

        ownerA = signers.at(0)!
        endpointOwner = signers.at(1)!

        // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
        // and its artifacts are connected as external artifacts to this project
        //
        // Unfortunately, hardhat itself does not yet provide a way of connecting external artifacts,
        // so we rely on hardhat-deploy to create a ContractFactory for EndpointV2Mock
        //
        // See https://github.com/NomicFoundation/hardhat/issues/1040
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    })

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZEndpoint with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        /// DEPLOY UniversalFactory

        uf = await UniversalFactory.deploy(mockEndpointV2A.address, ownerA.address);
        baseFactory = await OFTFactory.deploy(mockEndpointV2A.address, ownerA.address, 1); /// main chain
        oftFactoryB = await OFTFactory.deploy(mockEndpointV2B.address, ownerA.address, 2); /// side chain 
        
        // Setting destination endpoints in the LZEndpoint mock for each MyOFT instance
        await mockEndpointV2A.setDestLzEndpoint(oftFactoryB.address, mockEndpointV2B.address);
        await mockEndpointV2B.setDestLzEndpoint(uf.address, mockEndpointV2A.address);

        // Setting each MyOFT instance as a peer of the other in the mock LZEndpoint
        await oftFactoryB.connect(ownerA).setPeer(eidA, ethers.utils.zeroPad(uf.address, 32));
        await uf.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(oftFactoryB.address, 32));

        await uf.connect(ownerA).setBaseFactory(baseFactory.address);

        console.log("Deployment Done");

        console.log('UF address', uf.address);
        console.log('OFTA address', baseFactory.address);
        console.log('OFTB address', oftFactoryB.address);
    })

    
    it('Should deploy OFT token from Factory on each chain', async function () {

        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
        const nativeFee = await uf.quoteDeployment(["Meow", "MM"], options);

        await uf.deploy(["Meow", "MM"], options,{value : nativeFee.toString()});
        console.log(await uf.OFTAddressById(1))

        ///   await oftContract.send(sendParam, [nativeFee, 0], wallet.address, {value : nativeFee})

        /// console.log("PEERS", await uf.peers(2))

        ///    const oftAddress = await uf.OFTAddressById(1);

        ///     expect(oftAddress).not.equal(0);

        /* 
        const initialAmount = ethers.utils.parseEther('100')
        await myOFTA.mint(ownerA.address, initialAmount)

        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = ethers.utils.parseEther('1')

        // Defining extra message execution options for the send operation
        

        const sendParam = [
            eidB,
            ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ]

        console.log('sendParam', sendParam)

        // Fetching the native fee for the token send operation
        const [nativeFee] = await myOFTA.quoteSend(sendParam, false)

        // Executing the send operation from myOFTA contract
        await myOFTA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await myOFTA.balanceOf(ownerA.address)
        const finalBalanceB = await myOFTB.balanceOf(ownerB.address)

        // Asserting that the final balances are as expected after the send operation
        expect(finalBalanceA).eql(initialAmount.sub(tokensToSend))
        expect(finalBalanceB).eql(tokensToSend)

        */
    })
       
})
