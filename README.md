# [large-type.com](http://large-type.com) – Display and share messages in VERY LARGE TEXT from your browser

![](twitter-card.png)

## FAQs

### What do I use this for?
Here are some ideas:

* Remember that phone number while you're standing across the room?
    * [large-type.com/#(555)-123-456](http://large-type.com/#(555)-123-456)

* Co-worker needs to know your IP address?
    * [large-type.com/#192.168.1.23](http://large-type.com/#192.168.1.23)

* Share a password?
    * [large-type.com/#3Rs%xw8y$Jtnu](http://large-type.com/#3Rs%25xw8y%24Jtnu)

* Need a giant timer notification?
    * `$ sleep 10; open http://large-type.com/#Done!`

* Waiting for your code to compile?
    * `$ make; open http://large-type.com/#Done!`

* Secret message for a loved one?
    * [large-type.com/#I❤U](http://large-type.com/#I❤U)

### How do I use it?

### I found a bug! Now what?
Awesome! Please create an issue ticket on GitHub (and if you have a really good day, maybe a pull request 😃) so we can fix it. Thanks!

### Is this secure?
As per [RFC 2396](https://tools.ietf.org/html/rfc2396#section-4) browsers [don't send the URL fragment with the HTTP request](https://stackoverflow.com/questions/317760/how-to-get-url-hash-from-server-side). Thus sharing a link to large-type.com won't leak your secret word. Large-type.com is open-source, very small and hosted on GitHub Pages which means you can audit the source code to see that your data isn't sent or stored anywhere else.

## Meta
Design inspired by [1Password's](https://agilebits.com/onepassword) large-type feature.

Daniel Bader – [@dbader_org](https://twitter.com/dbader_org) – mail@dbader.org
