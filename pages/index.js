import React from 'react'
import { useState, useEffect } from 'react';

// Constants for WHitelist -> Merkl proof
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const whitelist = require('../data/whitelist.js').default;

export default function Home() {
    const [error,setError] = useState('');
    const [merklRoot,setMerklRoot] = useState('');
    
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
  
    return (
      <div className="App">
          <button className ="resume" onClick={generateRoot}>Generate Root</button>
          {error && <p>{error} </p>}
          {merklRoot && <p> Root : {merklRoot} </p>}
      </div>
    )
  }