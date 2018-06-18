-- phpMyAdmin SQL Dump
-- version 4.8.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 13, 2018 at 08:14 PM
-- Server version: 10.1.32-MariaDB
-- PHP Version: 5.6.36

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `oanda`
--

-- --------------------------------------------------------

--
-- Table structure for table `globalConfiguration`
--

CREATE TABLE `globalConfiguration` (
  `id` int(11) NOT NULL,
  `accountId` varchar(250) COLLATE utf8_bin NOT NULL,
  `instrument` varchar(250) COLLATE utf8_bin NOT NULL,
  `minPrice` varchar(250) COLLATE utf8_bin NOT NULL,
  `maxPrice` varchar(250) COLLATE utf8_bin NOT NULL,
  `takeProfit` varchar(250) COLLATE utf8_bin NOT NULL,
  `stopLoss` varchar(250) COLLATE utf8_bin NOT NULL,
  `maxUnits` int(11) NOT NULL,
  `alreadyInvested` int(11) NOT NULL DEFAULT '0',
  `enabled` int(5) NOT NULL DEFAULT '0',
  `type` varchar(200) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Dumping data for table `globalConfiguration`
--

INSERT INTO `globalConfiguration` (`id`, `accountId`, `instrument`, `minPrice`, `maxPrice`, `takeProfit`, `stopLoss`, `maxUnits`, `alreadyInvested`, `enabled`, `type`) VALUES
(1, '101-004-8382586-002', 'XAU_USD', '1294.001', '1295.401', '4', '10', 3, 1, 1, 'BUY'),
(2, '101-004-8382586-002', 'XAG_USD', '16.84914', '16.85214', '5', '10', 1, 1, 1, 'BUY'),
(3, '101-004-8382586-001', 'XAU_USD', '1295.001', '1295.401', '0.22', '10', 3, 0, 1, 'BUY'),
(4, '101-004-8382586-001', 'XAG_USD', '16.84914', '16.85214', '5', '1', 1, 0, 1, 'BUY');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `globalConfiguration`
--
ALTER TABLE `globalConfiguration`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `globalConfiguration`
--
ALTER TABLE `globalConfiguration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
