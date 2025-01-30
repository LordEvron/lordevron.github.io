---
id: 538
title: 'BitCoin Wallet Collider'
date: '2019-02-19T17:32:10+01:00'
author: Lord_evron
layout: post
permalink: /2019/02/19/bit-coin-wallet-collider/
categories:
    - Technical
tags:
    - bitcoin
    - technology
    - code
    - python
---

Ah, Bitcoin! Welcome to the world of cryptocurrencies, where decentralization reigns and fortunes are supposedly made by solving cryptographic puzzles. 
Over the past couple of years, I've heard a lot of misconceptions about Bitcoin, mostly from newly minted "investors" convinced it's the future.  
Some believe it offers complete anonymity, others that it was the first cryptocurrency. 
The reality is that there are now over 4,000 different cryptocurrencies, many of which are arguably superior to Bitcoin in certain aspects. 
For example, Bitcoin transactions can be slow, sometimes taking hours to confirm due to the 10-minute block mining time. 
Other altcoins offer much faster confirmations, often within minutes.  Regarding security and privacy, 
cryptocurrencies like Zcash and Monero offer enhanced features like Zcash's "shielded transactions" and Monero's "ring signatures," 
making them significantly more difficult to trace (and thus popular in less-than-legal circles). 
And Bitcoin certainly wasn't the first digital currency concept; e-cash can be traced back to the 1980s.
This isn't meant to be a dry lecture on Bitcoin's shortcomings. I just wanted to introduce this article alongside my latest code release.  
For testing purposes, I wrote a Bitcoin wallet "collider" (purely as a proof of concept).  It works as follows:

1. It fetches a list of the 7,000 richest Bitcoin wallets from a website.
2. It generates random private keys.
3. From each private key, it generates the corresponding public wallet address.
4. It checks if the newly generated wallet address is present in the list from step 1.
5. If it is, jackpot! You've (theoretically) found a private key for a rich wallet.

Essentially, it randomly generates wallets and checks if, by chance, one of them is on the list of the wealthiest. 
If it is, you (theoretically) control that wallet.
The code is available on my [GitHub repo](https://github.com/LordEvron/BTC_bruteforcer).  Check it out and read the *README.md* for details.
As a side note: No, I haven't found any collisions. The probability of finding one is so incredibly small that you'd have better 
luck winning the lottery. However, even if the probability is near zero, it's not actually zero, so...it's up to you. 


And don't forget to delete any private keys you might (improbably) find (I'm probably legally required to say that :D).

I have other fun code projects that I might release in the future, so stay tuned (maybe a botnet next?).

Have fun...and good luck!
