const  Sequelize  = require('sequelize');
const sequelize = require('../config/database');


var ev_to_add_event = ('ev_to_add_event', {
 
    event_name : Sequelize.STRING,
    `event_title` varchar(100) NOT NULL,
    `tickets` json NOT NULL,
    `venue_name` varchar(100) NOT NULL,
    `address` varchar(100) NOT NULL,
    `city` varchar(100) NOT NULL,
    `state` varchar(100) NOT NULL,
    `country` varchar(100) NOT NULL,
    `zipcode` varchar(60) NOT NULL,
    `service_tax` varchar(60) NOT NULL DEFAULT '0',
    `tax` varchar(60) NOT NULL DEFAULT '0',
    `start_date` varchar(100) NOT NULL,
    `end_date` varchar(100) NOT NULL,
    `event_category` varchar(100) NOT NULL,
    `event_category_id` int(10) NOT NULL,
    `description` text NOT NULL,
    `event_image` varchar(100) NOT NULL DEFAULT 'event_image-1581920110766.jpeg',
    `event_slug` varchar(100) NOT NULL,
    `start_time` varchar(10) NOT NULL,
    `end_time` varchar(10) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `thumbnail` varchar(100) NOT NULL DEFAULT 'thumbnail-1581331727699.png',
    `banner_image` varchar(100) DEFAULT NULL,
    `lat` double NOT NULL,
    `lng` double NOT NULL,
    `slider_image1` varchar(100) NOT NULL DEFAULT 'event_image-1581311211974.png',
    `slider_image2` varchar(100) NOT NULL DEFAULT 'slider_image2-1581920119082.jpeg',
    `slider_image3` varchar(100) NOT NULL DEFAULT 'slider_image3-1581920122280.jpeg',
    `min_price` varchar(100) NOT NULL DEFAULT '0',
    `max_price` varchar(100) NOT NULL DEFAULT '0',
    PRIMARY KEY (`id`)
}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;