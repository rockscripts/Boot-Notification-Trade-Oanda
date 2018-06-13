-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 29-05-2018 a las 22:39:48
-- Versión del servidor: 10.1.13-MariaDB
-- Versión de PHP: 5.6.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `oanda`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `globalConfiguration`
--

CREATE TABLE `globalConfiguration` (
  `id` int(11) NOT NULL,
  `accountId` varchar(150) NOT NULL,
  `type` varchar(10) NOT NULL,
  `instrument` varchar(10) NOT NULL,
  `minPrice` varchar(200) NOT NULL,
  `maxPrice` varchar(200) NOT NULL,
  `takeProfit` varchar(200) NOT NULL,
  `stopLoss` varchar(200) NOT NULL,
  `maxUnits` int(11) NOT NULL,
  `enabled` varchar(10) NOT NULL,
  `alreadyInvested` int(11) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `globalConfiguration`
--

INSERT INTO `globalConfiguration` (`id`, `accountId`, `type`, `instrument`, `minPrice`, `maxPrice`, `takeProfit`, `stopLoss`, `maxUnits`, `enabled`, `alreadyInvested`) VALUES
(21, '101-004-8382586-001', 'BUY', 'EUR_USD', '1.17556', '1.17650', '0.90', '5', 51, '0', 1),
(22, '101-004-8382586-001', 'BUY', 'XAU_USD', '1304.201', '1304.401', '3', '40', 20, '1', 1),
(23, '101-004-8382586-001', 'BUY', 'AUD_HKD', '1.12222', '1.12223', '0.5', '15', 100, '0', 0),
(25, '101-004-8382586-002', 'BUY', 'XAU_USD', '1300.501', '1300.601', '5', '15', 15, '0', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `globalConfiguration`
--
ALTER TABLE `globalConfiguration`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `globalConfiguration`
--
ALTER TABLE `globalConfiguration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
