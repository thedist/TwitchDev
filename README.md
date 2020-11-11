# TwitchDev-Tutorial-EventSub
Tutorial for implementing Twitch EventSub using serverless infrastructure. 

## EventSub

[**Introduction to EventSub on AWS**](/Tutorials/Intro-to-EventSub-on-AWS/README.md)

Serverless solutions such as those offered by AWS, Google Cloud, Microsoft Azure, and others, are a cost effective method of integrating with Twitch EventSub. Unlike traditional hosted, or virtualized, servers which often have a monthly or yearly rental which is applied regardless of if the server is utilized or not, Serverless solutions such as API Gateway, Lambda, and DynamoDB charge based on usage and can scale up and down as needed so you will not be paying for unused capacity.

This tutorial is intended as a basic introduction to how these services can be used with EventSub, and depending on your needs they may or may not be suitable in a production environment.

The goal is to have an internet accessible callback URL for Twitch to send notifications to, 2 Lambda functions (1 for subscribing, unsubscribing, and returning status data, and 1 function for handling incoming notifications), and a DyanmoDB database to store notifications. While the creation of this setup could be entirely automated, this hands-on tutorial should lead to a greater understanding of the underlying services involved.




