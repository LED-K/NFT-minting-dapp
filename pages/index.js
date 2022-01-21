import styles from '../styles/Home.module.css'
import React from 'react'
import { useState, useEffect } from 'react';
import {ethers, Contract, providers}  from 'ethers';
import CosmicMonkeyClub from '../src/artifacts/contracts/CosmicMonkeyClub.sol/CosmicMonkeyClub.json';

// Constants for WHitelist -> Merkl proof
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const whitelist = require('../scripts/whitelist.json');

//Const for Smart Contract
/////////!!!!!!!!! Replace here contract address and "reveal" URI!!!!!!!!!!!!!!!!/////////
const address = "0x9F7f55710B054a74D58535c3C8c9E4D7fe54a46c";
const NewBaseURI = "ipfs://QmTSCjV76zaEdi7H1n2Bdm33i5ZbtJ2otewx4n4S9gMqa9/";

//Const for App
//!!!!!!!!!!!!! Replace here with Contract owner PUB KEY!!!!!!!!!!!!!!!!!!!!!!
const owner = "0x830f625ff92d27f972cea9993a0323b9514b2c21";

//!!!!!!!!! Replace here with Total number of NFT's !!!!!!!!!!!!!!!!!!!
const MaxSupply = 10;


export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [price, setPrice] = useState();
  const [data, setData] = useState({});
  // Will be used later for messages in UI
  const [success,setSuccess] = useState('');
  const [error,setError] = useState('');


  React.useEffect( async () => {
    if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccounts(accounts); 
        fetchData();
        getPrice();
        
      //Listeners
      window.ethereum.addListener('connect', async(reponse) => {
        requestAccount();
      })
    
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    
      window.ethereum.on('chainChanged',() => {
        window.location.reload();
      })
    
      window.ethereum.on('disconnect',() => {
        window.location.reload();
      })
     // getPrice();
    }
  }, []);

  //Get account from metamask
  async function requestAccount() {
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccounts(accounts);
    }
  }

  //Get price value depending on Sale state
  async function getPrice() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, provider);
      const isPresale = await contract.getPresaleState();
      const isPublicSale = await contract.getPublicSaleState();
      try {
        if(isPresale){
        const data = await contract.getPresalePrice();
        setPrice(data);
        } else if(isPublicSale) {
            const data = await contract.getPublicSalePrice();
        setPrice(data);
        }   
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  //Request contract data and feed them to the useState
  async function fetchData() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, provider);
      try {
        let totalSupply = await contract.totalSupply();
        let pricePresale = await contract.getPresalePrice();
        let pricePublicSale = await contract.getPublicSalePrice();
        let isPresale = await contract.getPresaleState();
        let isPublicSale = await contract.getPublicSaleState();
        const object = {"PricePresale": String(pricePresale), "PricePublicSale" : String(pricePublicSale), "totalSupply": String(totalSupply),"Account" : String(accounts[0]), "isPresale" : isPresale, "isPublicSale" : isPublicSale}

        setData(object);
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  //Withdraw Money from Contract Address
  async function withdraw() {
    if(typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({method: 'eth_requestAccounts'});
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, signer);
      try {    
          const transaction = await contract.release("0xF4B29441765b9922953BfAf55160879268637697");
          await transaction.wait();
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  // Set new BaseURI
  async function newURI() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, signer);
      try { 
          //console.log(contract.getBaseURI());
          await contract.setBaseURI(NewBaseURI);
          //console.log(contract.getBaseURI());      
      }
      catch(err) {
        console.log(err.data.message);
      }
    }
  }

  //Start Presale

  async function startPresale(){
    if(typeof window.ethereum !== 'undefined') {
      let tab = [];
        whitelist.map(token => {
        tab.push(token.address);
      })
      try{
        const leaves = tab.map(address => keccak256(address));
        const tree = new MerkleTree(leaves, keccak256, { sort: true });
        const root = tree.getHexRoot();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, signer); 
        const startPresale= await contract.StartPresale(root);
        await startPresale.wait();
      }catch(err){
        console.log(err);
      }
    }

  }

  //Start Public Sale

  async function StartPublicSale(){
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, signer); 
      try {
        const startPublicSale = await contract.StartPublicSale();
        await startPublicSale.wait();
      }
      catch(err) {
        console.log(err.data.message);
      } 
    }
  }

  async function stopPresale(){
      if(typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, signer); 
        try {
          const stopPresale = await contract.StopPresale();
          await stopPresale.wait();
        }
        catch(err) {
          console.log(err);
        } 
      }
      fetchData();
    }
//Mint
  async function mint() {
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, CosmicMonkeyClub.abi, signer);
      const isPresale = await contract.getPresaleState();
      const isPublicSale = await contract.getPublicSaleState();
      //Construct array of whitelisted addresses from whitelist.json file
      let tab = [];
      whitelist.map(token => {
        tab.push(token.address)
      })

      //Merkl Tree construction before sending the proof to the smart contract
      const leaves = tab.map(v => keccak256(v));
      const tree = new MerkleTree(leaves, keccak256, { sort: true });
      const leaf = keccak256(accounts[0]);
      const proof = tree.getHexProof(leaf);
      //Additional parameters passed to the mint function in SMmrt contract
      try {
        let overrides = {
          from: accounts[0],
          value: price
        }
        console.log(accounts[0]);
        // If we're still in presale
        if(isPresale){
            //owner doesn't pay lol
            if(accounts[0] === owner){
                const transaction = await contract.mintPresale(1,accounts[0],proof);
                await transaction.wait();
            }else{
                const transaction = await contract.mintPresale(1,accounts[0], proof, overrides);
                await transaction.wait();
            }
        // Public Sale is ON 
        }else if (isPublicSale) {
            //Owner still doesn't pay
            if(accounts[0] === owner){
                const transaction = await contract.mintPublicSale(1);
                await transaction.wait();
            }else{
                const transaction = await contract.mintPublicSale(1,overrides);
                await transaction.wait();
            }  
        } else {
          setError("Sale is not Open Yet");
        }    
      }
      catch(err) {
        console.log(err);
        if(err.data.message==="execution reverted: Not on the whitelist"){
          setError("you are not Whitelisted");
          console.log("setting error");
        } else if(err.data.message === "execution reverted: United Lions: Presale mint is 3 tokens only."){
          setError("Max mint is 3 in Presale");
        }
      }
      //update all data
      fetchData();
    }
  }
  return (
    <div className="App">
        {!accounts[0] && <p>Please connect your metamask wallet</p>}
        {accounts[0] === owner && <button className="withdraw" onClick={withdraw}>Withdraw</button>}
        {accounts[0] === owner && <button className ="reveal" onClick={newURI}>Set new URI</button>}
        {accounts[0] === owner && <button className ="resume" onClick={StartPublicSale}>Start Public Sale</button>}
        {accounts[0] === owner && <button className ="resume" onClick={startPresale}>Start Presale</button>}
        {accounts[0] === owner && <button className ="resume" onClick={stopPresale}>Stop Presale</button>}
        <div className="container">
          <h1> Mint a Cosmic Monkey!</h1>
          <p className="count">{data.totalSupply} / 10</p>
          {data.isPresale && <p className="Price">Presale Price : {data.PricePresale / 10**18} Ether (excluding gas fees)</p>} 
          {data.isPublicSale && <p className="Price">Public Sale Price : {data.PricePublicSale / 10**18} Ether (excluding gas fees)</p>}
          {data.isPublicSale && <p className="SaleState"> Public Sale is open !</p>}
          {data.totalSupply == MaxSupply && <p>SOLD OUT !</p>}
           <button onClick={mint}>MINT</button><br></br>
          {error && <p>{error} </p>}
        </div>
    </div>
  )
}
