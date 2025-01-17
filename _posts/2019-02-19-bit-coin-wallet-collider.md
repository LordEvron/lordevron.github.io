---
id: 538
title: 'Bit Coin Wallet Collider'
date: '2019-02-19T17:32:10+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=538'
permalink: /2019/02/19/bit-coin-wallet-collider/
categories:
    - Technical
tags:
    - bitcoin
    - BTC
    - collider
    - python
    - Wallet
---

Ahh BitCoins! Welcome to the world of crypto currencies, where everything is decentralized and where making money is as easy as find a solution to a crypto-problem… In the latest two years i heard a lot of bullshit on BTC. Mostly by improvised investors which they somehow get convinced that BTC are the future. Some believe that they allow anonymous transactions, others believe that they were the first currency, etc. The truth is that as today, there are more than 4000 different cypto currencies and many of them are somehow better then BTC. For example, in BTC generally you will need to wait 10 mined blocks to confirm a transaction and each block needs an average of 10 minutes to be mined. This means that making a transaction in BTC can take quite long time, hours in worst case. On the other hand, other Altcoins can confirm transaction in less than 5 minutes. Regarding security, ZCASH or MONERO offers way better security and privacy with the ZCash “shield transactions” or the Monero “ring signatures” making it really untraceable (So untraceable that is the main choice of black hats). And BTC were not the first neither, since ecash concept can be tracked back to 80s.

Anyway, this is not supposed to be a boring article explaining why bitcoins are not what the people think. I just wanted to write this small article associated with my latest code release. Indeed, this week i decided to release some old code that i had. Basically, for TESTING purpose, i wrote a bit coin wallet collider (purely as proof of concept.) What it does is easy:

1- Fetch the list of the 7000 richest bitcoin wallet from a website  
2- Generate random private keys.  
3- From the private key , generate the associated wallet.  
4- Check If the new generated wallet is present in the list created in point 1.  
5- If yes, than you have found a jackpot!!!

So basically you randomly generate wallets and then you check if is by chance is one of the richest one.If yes, well then you hold its private key.

The code is in my [GIT REPO. ](https://github.com/LordEvron/BTC_bruteforcer) You can look at the code there and find out more Also, read the README.md for more details.

Just one curiosity. No, i haven’ t found any collision. And the probability of finding one is so small that is better to play national lottery. However, even if the probability is close to 0, is actually not 0 so… up to you…And do not forget to delete the private key once that you found a collision (I am probably required to state that by law….)

Also I Have a lot of other funny code , that i may be releasing in the future, so stay tuned (maybe the next one is a bootnet? ) 🙂

Have fun…and good luck..