# You should check out the *new* mcpe.me service https://github.com/Falkirks/mcpeme



>MCPEDNS (mcpe.me)
>==================
>MCPEDNS is a hostname creation service. It is used on mcpe.me.

>### Environment variables
>* `CLOUDFLARE_EMAIL` - Email of your CloudFlare account.
>* `CLOUDFLARE_TOKEN` - CloudFlare client API key.
>* `CLOUDFLARE_DOMAIN` - Domain to distribute hostnames on.
>* `CAPTCHA_PUBLIC` - RECAPTCHA public key.
>* `CAPTCHA_SECRET` - RECAPTCHA secret key.

>### Running on Heroku
>Start by cloning this repository
>```sh
>$ git clone https://github.com/Falkirks/MCPEDNS 
>```
>Then switch to the install directory and remove the connection to this remote
>
>```sh
>$ cd MCPEDNS
>$ git remote remove origin
>```
>Now create your Heroku app 

>```sh
>$ heroku create 
>```
>You can specify a name if you like

>```sh
>$ heroku create myCoolApp
>```
>After that is done, you will have to configure your app
>```sh
>$ heroku config:add CLOUDFLARE_EMAIL=(Email of your CloudFlare account)
>$ heroku config:add CLOUDFLARE_TOKEN=(CloudFlare client API key)
>$ heroku config:add CLOUDFLARE_DOMAIN=(Domain to distribute hostnames on)
>$ heroku config:add CAPTCHA_PUBLIC=(RECAPTCHA public key)
>$ heroku config:add CAPTCHA_SECRET=(RECAPTCHA secert key)
>```
>Phew, now you need to create a database instance to store client submissions in
>```sh
>$ heroku addons:add mongolab
>```
>The app is ready to go now
>```sh
>$ git push heroku master
>```
