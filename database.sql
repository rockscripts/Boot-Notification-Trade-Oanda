-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jul 25, 2018 at 08:54 PM
-- Server version: 10.1.13-MariaDB
-- PHP Version: 5.6.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
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
  `sMinPrice` varchar(250) COLLATE utf8_bin NOT NULL,
  `sMaxPrice` varchar(250) COLLATE utf8_bin NOT NULL,
  `takeProfit` varchar(250) COLLATE utf8_bin NOT NULL,
  `stopLoss` varchar(250) COLLATE utf8_bin NOT NULL,
  `maxUnits` int(11) NOT NULL,
  `alreadyInvested` int(11) NOT NULL DEFAULT '0',
  `enabled` int(5) NOT NULL DEFAULT '0',
  `type` varchar(200) COLLATE utf8_bin NOT NULL,
  `bull` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `bear` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `macd` text COLLATE utf8_bin,
  `macdMacro` text COLLATE utf8_bin,
  `macdMicro` text COLLATE utf8_bin,
  `macdStatus` varchar(200) COLLATE utf8_bin NOT NULL DEFAULT 'unotified',
  `strategy` varchar(250) COLLATE utf8_bin NOT NULL DEFAULT 'macd',
  `candlesCount` int(11) NOT NULL DEFAULT '100',
  `candlesGranularity` varchar(10) COLLATE utf8_bin NOT NULL DEFAULT 'H1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Table structure for table `transactionPL`
--

CREATE TABLE `transactionPL` (
  `orderID` int(11) NOT NULL,
  `instrument` varchar(100) NOT NULL,
  `units` int(11) NOT NULL,
  `pl` varchar(200) NOT NULL,
  `reason` varchar(100) NOT NULL,
  `accountID` varchar(250) NOT NULL,
  `time` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `globalConfiguration`
--
ALTER TABLE `globalConfiguration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactionPL`
--
ALTER TABLE `transactionPL`
  ADD PRIMARY KEY (`orderID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `globalConfiguration`
--
ALTER TABLE `globalConfiguration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
