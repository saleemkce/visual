# visual
### Visualization and reporting application for [TimeOnSite Tracker](https://github.com/saleemkce/timeonsite)

This application module for Time on site tracker is available in **PHP** and **NodeJS** and is comprised of two sections: frontend and backend

**frontend** - it contains datatable reports and dc.js charts

**backend** - (PHP/NodeJs) it contains code for manipulating data in DB.

If you are using PHP as backend, ignore nodejs folder in visual application and vice-versa.

When you have successfully installed this visualization application, you will be able to navigate to **data view** (reporting) and **chart view** (visualization) pages of the app highlighted in menu


# 5-minute installation
###### (it may take little more time if your server or DB environment is not ready. In that case, you need to install necessary software and follow the installation instructions given here)
## PHP
----------------------
* **Prerequisite:** You need to have PHP and MySql database installed (for example, XAMPP or similar env.)
* If you prefer backend as PHP, follow these steps. Otherwise, check instructions for NodeJs given here.
* Copy the visual application folder inside web server (for example, inside htdocs directory in case of XAMPP)
* Verify that language inside folder path **"visual\config\config.js"** is "php"; also verify other configuration URL paths for PHP are correct. Eg., reports, analytics etc. in same file
* Start web server and MySql DB
* Open database.php file in path **"visual\backend\php\database.php"**  Create db named "**tosdata**"; update username/password relevant to your DB.
* Download sample data for time on site tracker data available in [DB Dump](https://github.com/saleemkce/tos_dump/tree/master/php) - **tos.zip** and load in your **tosdata** MySql DB.
* Open the visualization application [http://localhost/visual/index.html](http://localhost/visual/index.html) in browser
---

### (or)

## NodeJs
----------------------
* **Prerequisite:** You need to have NodeJs and MongoDB installed
* If you prefer backend as NodeJs, follow these steps. Otherwise, check instructions for PHP given here.
* Copy the visual application folder inside anywhere in your projects directory
* Verify that language inside folder path **"visual\config\config.js"** is "nodeJs"; also verify other configuration URL paths for NodeJs are correct. Eg., reports, analytics etc. in same file
* start MongoDB
* Open settings.js file in path **"visual\backend\nodejs\settings.js"**  Create db named "**tosdata**"; update username/password relevant to your DB. Default port number for this node application is 4500; you may it change later if necessary.
* Download sample data for time on site tracker data available in [DB Dump](https://github.com/saleemkce/tos_dump/tree/master/nodejs) - **tosdata.zip** and load in your **tosdata** MongoDB.
* Go to root **"visual\backend\nodejs"**; open a terminal and give "npm install"
* Give "node server.js" to start application.
* Open the visualization application [http://localhost/visual/index.html](http://localhost/visual/index.html) in browser
