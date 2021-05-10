# Step 1: Point hosts on your machine file to DigitalOcean IP
Mac or Linux: Edit /etc/hosts
or
Windows: Edit C:\Windows\System32\drivers\etc\hosts

    167.172.137.176 mdp.learninga-z.com
    
# Step 2: Visit http://mdp.learninga-z.com/ 

# Step 3: Add SSH Keys to Droplet
Using Cygwin or Terminal on your personal machine, create a new key pair for this droplet:
   
    ssh-keygen -f ~/.ssh/mdp_2020_droplet -t ed25519
   
Add the following lines to the config file in your .ssh directory. You may have to create the config file.
   
    Host mdp.learninga-z.com
       IdentityFile ~/.ssh/mdp_2020_droplet

Copy the contents of your public key, and email to Tyler, or upload to the [DigitalOcean console](https://cloud.digitalocean.com/account/security), if you have access.
   
    cat ~/.ssh/mdp_2020_droplet.pub
       
Have someone with access to the droplet add your public key to the droplet's ~/.ssh/authorized_keys file.

# Step 5: Commit your Changes to Master & Push

# Step 4: Update the Server's Code

    ssh root@mdp.learninga-z.com "cd /var/www && git pull origin master"

# Step 6: Refresh http://mdp.learninga-z.com/
Verify that your changes are on the server.