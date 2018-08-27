#### Passwordless user authentication system for web apps using MetaMask with PHP, Vue.js, JWT and MySQL ####

Demo: https://setinblock.com/php-metamask-user-login
<br>
<br>
### About
This is similar to CryptoKitties passwordless user login but made with PHP instead of the traditional way of doing it on Node with Express and ethereumjs-util.

The concept of such user authentication system (initially based on [this article](https://hackernoon.com/never-use-passwords-again-with-ethereum-and-metamask-b61c7e409f0d)) is as follows: The backend provides a random message for the user to sign it with his or her MetaMask wallet. The signed message is then returned to the backend, together with the user's public Ethereum address. Having the `message`, the `same message signed by the user` and user's `public address`, the backend can perform some cryptographic magic in order to know if the message was signed with the same private key to which the `public address` belongs. The `public address` also works as a username to identify the user's account. If the `signed message` and `public address` belong to the same private key, it means that the user who is trying to log in is also the owner of the account.

After the successful validation, the backend creates a JSON Web Token (JWT) and sends it to the frontend to authenticate the further user requests.

The "Public name" input field (visible after the successful login) is just an example showing how to update user's metadata using JWT. When entered by the user, this field is stored in the db and loaded the next time the user logs in.

The cryptographic magic mentioned above is done using [Elliptic Curve Cryptography](https://github.com/simplito/elliptic-php) and [Keccak (SHA-3)](https://github.com/kornrunner/php-keccak) libraries. The necessary parts of these libraries are bundled into the source of this repository, but if you wish, you can install them separately using Composer. Keccak requires PHP version 7.1.0 or higher.
<br>
<br>
### Quick launch

To launch the demo app provided in this repository, first download all files. Then put them in your remote or local PHP + MySQL server's public html directory. Create an empty mysql database, edit credentials in `server/config.php` and then open `create_db_table.php` in your browser. Then open `index.html`.
<br>
<br>
### Issues

Report issues in [issue tracker](https://github.com/dziungles/php-metamask-user-login/issues).
<br>
<br>
### Contribution

Feel free to make a pull request or suggest ideas.
