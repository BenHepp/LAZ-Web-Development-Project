# Step 1: CREATE LAMP SERVER
https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-ubuntu-18-04
https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-phpmyadmin-on-ubuntu-18-04

# Step 2: SSH to server
    ssh root@167.172.137.176

# Step 3: Clone Git
    rm -rf /var/www/*
    git clone https://github.com/kwantando/LAZMDP-2020 /var/www

# Step 4: Setup Config file
    cd /var/www && sudo cp mdp.learninga-z.com.conf /etc/apache2/sites-available/mdp.learninga-z.com.conf

# Step 5: Update php.ini to enable short tags
    find /etc/php/*/*/php.ini -type f -exec sed -i "s/short_open_tag = .*/short_open_tag = On/" {} \;

# Step 6: Enable Site
    mkdir log && sudo chmod 777 /var/www/log/
    sudo a2ensite mdp.learninga-z.com.conf
    sudo service apache2 restart

# Step 7 Create MySQL User with and ensure config.inc.php has correct credentials
    sudo mysql -u root -p -e "CREATE USER mdpuser@localhost IDENTIFIED BY 'mdppass';  GRANT ALL PRIVILEGES ON *.* TO mdpuser@localhost; Flush Privileges;"

# Step 8 Create Example Database Schema
    sudo mysql -u root -D mysql -p < /var/www/html/example/src/dataAccess/example_students.sql

# Step 9: Point hosts on your machine file to digital ocean IP
Mac or Linux: Edit /etc/hosts
or
Windows: Edit C:\Windows\System32\drivers\etc\hosts

167.172.137.176 mdp.learninga-z.com

# Step 10: Visit http://mdp.learninga-z.com/ 

# Step 11: Add Deploy Key to Droplet

This step allows the server to pull from the repo, without being prompted for a user/password.

Use ssh-keygen to create the key pair on the droplet.
   
    ssh-keygen -f ~/.ssh/droplet_readonly_deploy_key -t ed25519

Add the following to the droplet's ~/.ssh/config file

       Host LAZMDP-2020.github.com
           HostName github.com
           IdentityFile ~/.ssh/droplet_readonly_deploy_key

Upload the public key to the GitHub repo's Settings > Deploy keys section.

cd to the git repo on the server, execute the following:
   
    git remote set-url origin git@LAZMDP-2020.github.com:kwantando/LAZMDP-2020.git
   
Test with the following

    ssh -T git@LAZMDP-2020.github.com
   
You should see a success message, and be able to pull without being prompted for a password.