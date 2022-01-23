import React from 'react'
import { useState, useEffect } from 'react';
import {ethers, Contract, providers}  from 'ethers';
// Constants for WHitelist -> Merkl proof
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const whitelist = require('../data/whitelist.js').default;

export default function Home() {
    const [error,setError] = useState('');
    const [merklRoot,setMerklRoot] = useState('');
    const [merkleProof,setMerkleProof] = useState('');
    
    async function generateRoot(){
      if(typeof window.ethereum !== 'undefined') {
        try{
          const leaves = whitelist.map(address => keccak256(address));
          const tree = new MerkleTree(leaves, keccak256, { sort: true });
          const root = tree.getHexRoot();
          setMerklRoot(root);
        }catch(err){
          setError(err);
        }
      }  
    }
    async function generateProof(){
      if(typeof window.ethereum !== 'undefined') {
        try{
          
          const leaves = whitelist.map(address => keccak256(address));
          const tree = new MerkleTree(leaves, keccak256, { sort: true });
          const leaf = keccak256("0x7d7c0B253F6CAf09669D41Ee4c5Db56239e3bCbA");
          const proof = tree.getHexProof(leaf);
          setMerkleProof(proof);
        }catch(err){
          setError(err);
        }
      }  
    }
  
    return (
      <div className="App">
          <button className ="resume" onClick={generateRoot}>Generate Root</button>
          <button className ="resume" onClick={generateProof}>Generate proof</button>
          {error && <p>{error} </p>}
          {merklRoot && <p> Root : {merklRoot} </p>}
          {merkleProof && <p> proof : {merkleProof} </p>}
          
      </div>
    )
  }