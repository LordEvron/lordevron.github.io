---
id: 250207
title: 'Bypassing ISP Surveillance: DoT and Encrypted Client Hello'
date: '2025-03-14'
author: Lord_evron
layout: post
permalink: /2025/03/14/bypassing-isp-surveillance/
categories:
    - Technical
tags:
    - technology
    - linux
    - hack
    - security
---
I recently wrote about Tails OS, a system designed for strong privacy. After that, a friend asked me a good question: 'Is there a way to get better privacy online without using something like Tor/Tails?' They wanted to improve their privacy without changing their whole operating system. This article is my answer. It explains how to hide more of your online activity from your internet provider, using simple changes to your connection.


## The basic
Before we attempt to mitigate the issue, we need to understand where the problem lies. In order to do so we need two key concepts (dns and tls handshake) that I am going to quickly resume here.

### Role of DNS

Every time you type a website address into your browser, like 'example.com,' your computer needs to find its numerical 'address' on the internet, known as an IP address. This is where the Domain Name System (DNS) comes into play. Your computer sends a request to a DNS server, essentially asking, 'What's the IP address for example.com?' Traditionally, this request is sent in plain text. This is crucial because your Internet Service Provider (ISP) acts as the gateway to the internet. They handle all your internet traffic. As a result, they can see every DNS request you make, meaning they can see every website you're trying to visit, simpling by looking at those dns packets.

### The TLS Handshake and SNI

Once the DNS server provides the website's IP address, your computer attempts to establish a secure connection with the website's server. Assuming that the site is using https, the process of establishing this secure connection is called the TLS handshake. During this handshake, your computer and the website's server exchange information to agree on a secure method of communication, how to encrypt the data etc. However, in the handshake process, a piece of information called the `Server Name Indication (SNI)` is sent in plain text in the **Client Hello message**. The SNI primary purpose is to allow a server to host multiple TLS certificates on a single IP address. This is crucial for web hosting providers who host numerous websites on their servers. Indeed, immagine that you have a server with *pablo.com* and *pedro.com* websites and a client (user) want to start the connection with one of them. The server must know which site the client want to visit, so it can present the correct certificate for the right website. However, client cannot encrypt the traffic yet, because it does not have a certificate (key) to use. So this is why the client during the handshake, add a SNI field, where it states that want to visit *pablo.com*. The server now can return the *pablo.com* certificate that contains encryption keys, and the client that finally use those key to encrypt traffic. After that the connection is point to point encrypted.
Here is an example of the client hello message that I captured using wireshark. 

 <div style="width: 100%; max-width: 700px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2025/sni-no-ech.png" 
       alt="SNI field sent in clear text in the Client Hello message" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    SNI sent in clear text in the Client Hello message.
  </div>
</div>


Once that is clear we can understand that we are leaking information both on dns query and during the TLS handshake. So lets fix those.

# Step 1: Encrypting DNS traffic 
The fist information leak problem is of easy resolution, since is enough that we encrypt that dns traffic. 
The two primary methods of encrypting DNS queries are: *DNS over TLS (DoT)* and *DNS over HTTPS (DoH)*. 
DoT encrypts DNS queries using the Transport Layer Security (TLS) protocol, securing them from eavesdropping. 
DoH, on the other hand, encapsulates DNS queries within HTTPS traffic, making them indistinguishable from regular web browsing. 
Both methods prevent your ISP from seeing the websites you're trying to visit at dns level.

A common approach to enable DoT in linux is to use systemd-resolved, which supports DoT.
To do so, is enough to edit the `/etc/systemd/resolved.conf` file and add/uncomment the following lines: 

```
DNS=9.9.9.9#dns.quad9.net 1.1.1.1#cloudflare-dns.com 1.0.0.1#cloudflare-dns.com
DNSSEC=yes
DNSOverTLS=yes
```
I enabled DNSSEC here too, but it does not fully work with TLS, since the dns server will do the validation for you. 
Maybe I will go more in details on this in a future article. 

Once you modified the file, Apply the changes by restarting the service: `sudo systemctl restart systemd-resolved`.
If you type now `resolverctl` command,  it will show that the DNS-Over-tls is enabled. 
you can also see from the wireshark traffic. 

 <div style="width: 100%; max-width: 700px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2025/dns-over-tls.png" 
       alt="Encrypted dns query" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    Encrypted DNS query
  </div>
</div>

Beyond operating system-level configuration, DNS over HTTPS (DoH) can also be enabled directly within web browsers like Chrome and Firefox. This provides a convenient way to protect your DNS queries without system-wide changes.

#### Firefox:

* Open Firefox and navigate to `about:preferences#privacy`.
* Scroll down to the "DNS over HTTPS" section.
* Select "Enable DNS over HTTPS."
* Choose a provider from the dropdown menu (e.g., Cloudflare, NextDNS) or select "Custom" to enter a specific DoH server URL.

#### Chrome:

* Open Chrome and navigate to `chrome://settings/security`.
* Scroll down to the "Use secure DNS" section.
* Toggle the switch to enable it.
* Choose a provider from the dropdown menu (e.g., Cloudflare, NextDNS) or select "Custom" to enter a specific DoH server URL.

**NB:** Enabling DoH within your browser ensures that your DNS queries are encrypted within the browser itself. However, it's important to note that this browser-based DoH configuration only protects DNS requests originating from that specific browser. Other applications on your system may still use unencrypted DNS unless you configure it at the operating system level.

# Step 2: Encrypted Client Hello 
As we've discussed, the Server Name Indication (SNI) has historically been sent in plaintext during the TLS handshake, revealing the specific website you're visiting to your ISP and other network observers. This creates a significant privacy vulnerability, even when the rest of your connection is encrypted. 
To address this, `Encrypted Client Hello (ECH)` was developed. ECH is the evolution of Encrypted SNI (ESNI). In ESNI, only the SNI was encrypted, 
while in the ECH almost the entire 'ClientHello' message (the initial message sent by your browser during the TLS handshake) is encrypted. 
Instead of seeing the plaintext SNI, observers will only see encrypted data, making it impossible to determine the specific website you are connecting to. 
ECH therefore address the privacy gap left by the unencrypted SNI, providing a much stronger level of protection for your browsing activity.

### ECH: Technical Details
Let's see in technical detail how ECH works, including the role of DNS keys and how it encrypts the ClientHello:

1. **ECH Configuration in DNS:** Websites that support ECH publish their ECH configuration in DNS records. 
This configuration includes the website's public key, which is used for encrypting the ClientHello message.
2. **Retrieving the ECH Configuration:** When your browser attempts to connect to a website, it first performs a DNS lookup to retrieve the website's IP address. 
If the website supports ECH, the DNS response will also include the ECH configuration (the public key).  
3. **Generating the Encrypted ClientHello:** Your browser uses the website's public key to encrypt the ClientHello message. 
This encryption covers all the sensitive information within the message, including the SNI.  
4. **Sending the Encrypted ClientHello:** Your browser sends the encrypted ClientHello to the website's server.
5. **Decryption and Connection:** The website's server, which possesses the corresponding private key, decrypts the ClientHello message. 
This allows the server to determine which website the client is requesting and to complete the TLS handshake.


In practice, ECH leverages public-key cryptography and DNS to securely distribute the necessary information for encrypting the ClientHello.
This process requires a valid DNSSEC signature to be fully secure, preventing man in the middle attacks that would 
replace the ECH public key with a malicious one, but again this is left for another article. 

### How can I enable ECH? 
The implementation of Encrypted Client Hello (ECH) is primarily a server-side responsibility. Website operators must configure their servers to support ECH 
by publishing the necessary information in their DNS records. 

From a user prospective, all new browsers use ECH by default when secure DNS is in place and dns response contains ECH public key. 
Therefore, the availability of ECH protection depends on the websites you visit having implemented it on their respective servers.

Here you can see the capture of a ECH enabled website. 

 <div style="width: 100%; max-width: 700px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2025/capture-ech.png" 
       alt="Encrypted Client Hello" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    Encrypted Client Hello
  </div>
</div>

You can also check if the DNS has the ECH enabled with the DIG command. See the difference between this two sites. 
```bash
dig type65 reddit.com
dig type65 abcnews.al

```
The second response will have an ech public key associated like this:


`ipv4hint=104.21.36.186, 172.67.94.23 ech=AEX+DQB....`


# Why is that useful?
Some readers, may still think that this is a bit pointless, since the ISP still route all our traffic to the final destination.
So, Even with the implementation of Encrypted Client Hello (ECH) and DNS over HTTPS (DoH), a fundamental limitation remains: 
your Internet Service Provider (ISP) still has visibility into the final server you are connecting to. 
This is because your ISP act like a post office; they see the destination address (IP) on every message you send.


But here's why ECH and DoH are still really useful: many websites use something called a reverse proxy, like *Cloudflare*. 
These proxies are a big part of how the internet works today. They sit between you and the websites you visit. 
They make websites faster, safer, and handle lots of traffic. And most importantly, *these proxies let many websites share the same internet address*.

So, when you connect to a website that utilizes a reverse proxy, your ISP only can see the connection to the proxy's IP, 
not the specific website you are accessing. And this is where ECH plays a key role. By encrypting the ClientHello message, 
which includes the Server Name Indication (SNI), ECH prevents your ISP from knowing which of the numerous websites behind the proxy you are accessing. 
This is particularly true in today's web environment, where a vast number of websites rely on Content Delivery Network (CDN). 
Without ECH, (and even with encrypted DNS), your browsing activity within these shared infrastructures would still be visible. 
ECH makes sure that you maintain the browsing privacy by hiding your final destination, even when the ISP has visibility of the 
connection to the proxy's server.


## Conclusion:

In conclusion, employing DNS over HTTPS/TLS (DoH/DoT) and Encrypted Client Hello (ECH) significantly improve online privacy 
by hiding your browsing activity from your Internet Service Provider (ISP). DoH/DoT encrypts your DNS queries, 
preventing your ISP from seeing the websites you're looking up, while ECH hides the specific website you're connecting to within a 
shared server environment, like those using reverse proxies or CDN.
However, it's important to understand that these methods do not provide complete anonymity (for example when a server has only one site hosted) 
or when an attacker prevents you from fetching ech key from dns server (forcing the handshake the fallback to standard unencrypted client hello). 

A Virtual Private Network (VPN), when configured correctly and free from DNS leaks, remains a better solution 
for hiding all your network traffic from ISP.  
So, while DoH/DoT and ECH offer good privacy improvements, they should be considered as complementary 
tools within a larger privacy strategy, rather than a complete replacement for a well-configured VPN.

As always, I hope you Learn something :) !
