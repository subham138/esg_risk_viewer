-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 21, 2023 at 04:00 PM
-- Server version: 10.4.8-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `esg_risk_viewer`
--

-- --------------------------------------------------------

--
-- Table structure for table `md_busi_act`
--

CREATE TABLE `md_busi_act` (
  `id` int(11) NOT NULL,
  `sec_id` int(11) NOT NULL,
  `ind_id` int(11) NOT NULL,
  `busi_act_name` varchar(100) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_busi_act`
--

INSERT INTO `md_busi_act` (`id`, `sec_id`, `ind_id`, `busi_act_name`, `created_by`, `created_dt`) VALUES
(1, 1, 1, '13.1 Preparation and spinning of textile fibres', 'admin@gmail.com', '2023-08-25 00:00:00'),
(2, 1, 1, '13.2 Weaving of textiles', 'admin@gmail.com', '2023-08-26 00:00:00'),
(3, 1, 1, '13.3 Finishing of textiles', 'admin@gmail.com', '2023-08-27 00:00:00'),
(4, 1, 1, '13.91 Manufacture of knitted and crocheted fabrics', 'admin@gmail.com', '2023-08-28 00:00:00'),
(5, 1, 1, '13.94 Manufacture of cordage, rope, twine and netting', 'admin@gmail.com', '2023-08-29 00:00:00'),
(6, 1, 1, '13.95 Manufacture of non-wovens and articles made from non-wovens, except apparel', 'admin@gmail.com', '2023-08-30 00:00:00'),
(7, 1, 1, '13.96 Manufacture of other technical and industrial textiles', 'admin@gmail.com', '2023-08-31 00:00:00'),
(8, 1, 1, '13.99 Manufacture of other textiles n.e.c.', 'admin@gmail.com', '2023-09-01 00:00:00'),
(9, 1, 1, '14.11 Manufacture of leather clothes', 'admin@gmail.com', '2023-09-02 00:00:00'),
(10, 1, 1, '14.12 Manufacture of workwear', 'admin@gmail.com', '2023-09-03 00:00:00'),
(11, 1, 1, '14.13 Manufacture of other outerwear', 'admin@gmail.com', '2023-09-04 00:00:00'),
(12, 1, 1, '14.14 Manufacture of underwear', 'admin@gmail.com', '2023-09-05 00:00:00'),
(13, 1, 1, '14.19 Manufacture of other wearing apparel and accessories', 'admin@gmail.com', '2023-09-06 00:00:00'),
(14, 1, 1, '14.2 Manufacture of articles of fur', 'admin@gmail.com', '2023-09-07 00:00:00'),
(15, 1, 1, '14.31 Manufacture of knitted and crocheted hosiery', 'admin@gmail.com', '2023-09-08 00:00:00'),
(16, 1, 1, '14.39 Manufacture of other knitted and crocheted apparel', 'admin@gmail.com', '2023-09-09 00:00:00'),
(17, 1, 1, '15.11 Tanning and dressing of leather; dressing and dyeing of fur', 'admin@gmail.com', '2023-09-10 00:00:00'),
(18, 1, 1, '15.12 Manufacture of luggage, handbags and the like, saddlery and harness', 'admin@gmail.com', '2023-09-11 00:00:00'),
(19, 1, 1, '15.2 Manufacture of footwear', 'admin@gmail.com', '2023-09-12 00:00:00'),
(20, 1, 1, '32.12 Manufacture of jewellery and related articles', 'admin@gmail.com', '2023-09-13 00:00:00'),
(21, 1, 1, '32.13 Manufacture of imitation jewellery and related articles', 'admin@gmail.com', '2023-09-14 00:00:00'),
(22, 1, 2, '27.51 Manufacture of electric domestic appliances', 'admin@gmail.com', '2023-09-15 00:00:00'),
(23, 1, 2, '27.52 Manufacture of non-electric domestic appliances', 'admin@gmail.com', '2023-09-16 00:00:00'),
(24, 1, 2, '28.24 Manufacture of power-driven hand tools', 'admin@gmail.com', '2023-09-17 00:00:00'),
(25, 1, 3, '13.92 Manufacture of made-up textile articles, except apparel', 'admin@gmail.com', '2023-09-18 00:00:00'),
(26, 1, 3, '13.93 Manufacture of carpets and rugs', 'admin@gmail.com', '2023-09-19 00:00:00'),
(27, 1, 3, '16.29 Manufacture of other products of wood; manufacture of articles of cork, straw and plaiting mat', 'admin@gmail.com', '2023-09-20 00:00:00'),
(28, 1, 3, '22.29 Manufacture of other plastic products', 'admin@gmail.com', '2023-09-21 00:00:00'),
(29, 1, 3, '23.41 Manufacture of ceramic household and ornamental articles', 'admin@gmail.com', '2023-09-22 00:00:00'),
(30, 1, 3, '23.49 Manufacture of other ceramic products', 'admin@gmail.com', '2023-09-23 00:00:00'),
(31, 1, 3, '25.71 Manufacture of cutlery', 'admin@gmail.com', '2023-09-24 00:00:00'),
(32, 1, 3, '26.4 Manufacture of consumer electronics', 'admin@gmail.com', '2023-09-25 00:00:00'),
(33, 1, 3, '26.52 Manufacture of watches and clocks', 'admin@gmail.com', '2023-09-26 00:00:00'),
(34, 1, 3, '31.02 Manufacture of kitchen furniture', 'admin@gmail.com', '2023-09-27 00:00:00'),
(35, 1, 3, '31.03 Manufacture of mattresses', 'admin@gmail.com', '2023-09-28 00:00:00'),
(36, 1, 3, '31.09 Manufacture of other furniture', 'admin@gmail.com', '2023-09-29 00:00:00'),
(37, 1, 3, '32.99 Other manufacturing n.e.c.', 'admin@gmail.com', '2023-09-30 00:00:00'),
(38, 1, 3, '41.1 Development of building projects', 'admin@gmail.com', '2023-10-01 00:00:00'),
(39, 1, 4, '47.19 Other retail sale in non-specialised stores', 'admin@gmail.com', '2023-10-02 00:00:00'),
(40, 1, 4, '47.19 Other retail sale in non-specialised stores', 'admin@gmail.com', '2023-10-03 00:00:00'),
(41, 1, 4, '47.91 Retail sale via mail order houses or via Internet', 'admin@gmail.com', '2023-10-04 00:00:00'),
(42, 1, 4, '47.99 Other retail sale not in stores, stalls or markets', 'admin@gmail.com', '2023-10-05 00:00:00'),
(43, 1, 5, '17.22 Manufacture of household and sanitary goods and of toilet requisites', 'admin@gmail.com', '2023-10-06 00:00:00'),
(44, 1, 5, '20.41 Manufacture of soap and detergents, cleaning and polishing preparations', 'admin@gmail.com', '2023-10-07 00:00:00'),
(45, 1, 5, '20.42 Manufacture of perfumes and toilet preparations', 'admin@gmail.com', '2023-10-08 00:00:00'),
(46, 1, 5, '32.91 Manufacture of brooms and brushes', 'admin@gmail.com', '2023-10-09 00:00:00'),
(47, 1, 6, '45.11 Sale of cars and light motor vehicles', 'admin@gmail.com', '2023-10-10 00:00:00'),
(48, 1, 6, '45.19 Sale of other motor vehicles', 'admin@gmail.com', '2023-10-11 00:00:00'),
(49, 1, 6, '45.32 Retail trade of motor vehicle parts and accessories', 'admin@gmail.com', '2023-10-12 00:00:00'),
(50, 1, 6, '45.4 Sale, maintenance and repair of motorcycles and related parts and accessories', 'admin@gmail.com', '2023-10-13 00:00:00'),
(51, 1, 6, '47.3 Retail sale of automotive fuel in specialised stores', 'admin@gmail.com', '2023-10-14 00:00:00'),
(52, 1, 6, '47.41 Retail sale of computers, peripheral units and software in specialised stores', 'admin@gmail.com', '2023-10-15 00:00:00'),
(53, 1, 6, '47.42 Retail sale of telecommunications equipment in specialised stores', 'admin@gmail.com', '2023-10-16 00:00:00'),
(54, 1, 6, '47.43 Retail sale of audio and video equipment in specialised stores', 'admin@gmail.com', '2023-10-17 00:00:00'),
(55, 1, 6, '47.51 Retail sale of textiles in specialised stores', 'admin@gmail.com', '2023-10-18 00:00:00'),
(56, 1, 6, '47.52 Retail sale of hardware, paints and glass in specialised stores', 'admin@gmail.com', '2023-10-19 00:00:00'),
(57, 1, 6, '47.53 Retail sale of carpets, rugs, wall and floor coverings in specialised stores', 'admin@gmail.com', '2023-10-20 00:00:00'),
(58, 1, 6, '47.54 Retail sale of electrical household appliances in specialised stores', 'admin@gmail.com', '2023-10-21 00:00:00'),
(59, 1, 6, '47.59 Retail sale of furniture, lighting equipment and other household articles in specialised store', 'admin@gmail.com', '2023-10-22 00:00:00'),
(60, 1, 6, '47.61 Retail sale of books in specialised stores', 'admin@gmail.com', '2023-10-23 00:00:00'),
(61, 1, 6, '47.62 Retail sale of newspapers and stationery in specialised stores', 'admin@gmail.com', '2023-10-24 00:00:00'),
(62, 1, 6, '47.63 Retail sale of music and video recordings in specialised stores', 'admin@gmail.com', '2023-10-25 00:00:00'),
(63, 1, 6, '47.64 Retail sale of sporting equipment in specialised stores', 'admin@gmail.com', '2023-10-26 00:00:00'),
(64, 1, 6, '47.65 Retail sale of games and toys in specialised stores', 'admin@gmail.com', '2023-10-27 00:00:00'),
(65, 1, 6, '47.71 Retail sale of clothing in specialised stores', 'admin@gmail.com', '2023-10-28 00:00:00'),
(66, 1, 6, '47.72 Retail sale of footwear and leather goods in specialised stores', 'admin@gmail.com', '2023-10-29 00:00:00'),
(67, 1, 6, '47.74 Retail sale of medical and orthopaedic goods in specialised stores', 'admin@gmail.com', '2023-10-30 00:00:00'),
(68, 1, 6, '47.75 Retail sale of cosmetic and toilet articles in specialised stores', 'admin@gmail.com', '2023-10-31 00:00:00'),
(69, 1, 6, '47.76 Retail sale of flowers, plants, seeds, fertilisers, pet animals and pet food in specialised st', 'admin@gmail.com', '2023-11-01 00:00:00'),
(70, 1, 6, '47.77 Retail sale of watches and jewellery in specialised stores', 'admin@gmail.com', '2023-11-02 00:00:00'),
(71, 1, 6, '47.78 Other retail sale of new goods in specialised stores', 'admin@gmail.com', '2023-11-03 00:00:00'),
(72, 1, 6, '47.79 Retail sale of second-hand goods in stores', 'admin@gmail.com', '2023-11-04 00:00:00'),
(73, 1, 6, '47.81 Retail sale via stalls and markets of food, beverages and tobacco products', 'admin@gmail.com', '2023-11-05 00:00:00'),
(74, 1, 6, '47.82 Retail sale via stalls and markets of textiles, clothing and footwear', 'admin@gmail.com', '2023-11-06 00:00:00'),
(75, 1, 6, '47.89 Retail sale via stalls and markets of other goods', 'admin@gmail.com', '2023-11-07 00:00:00'),
(76, 1, 6, '77.21 Rental and leasing of recreational and sports goods', 'admin@gmail.com', '2023-11-08 00:00:00'),
(77, 1, 6, '77.22 Rental of video tapes and disks', 'admin@gmail.com', '2023-11-09 00:00:00'),
(78, 1, 6, '77.29 Rental and leasing of other personal and household goods', 'admin@gmail.com', '2023-11-10 00:00:00'),
(79, 1, 6, '95.21 Repair of consumer electronics', 'admin@gmail.com', '2023-11-11 00:00:00'),
(80, 1, 6, '95.22 Repair of household appliances and home and garden equipment', 'admin@gmail.com', '2023-11-12 00:00:00'),
(81, 1, 6, '95.24 Repair of furniture and home furnishings', 'admin@gmail.com', '2023-11-13 00:00:00'),
(82, 1, 6, '95.29 Repair of other personal and household goods', 'admin@gmail.com', '2023-11-14 00:00:00'),
(83, 1, 6, '47.19 Other retail sale in non-specialised stores', 'admin@gmail.com', '2023-11-15 00:00:00'),
(84, 1, 6, '47.19 Other retail sale in non-specialised stores', 'admin@gmail.com', '2023-11-16 00:00:00'),
(85, 1, 6, '47.91 Retail sale via mail order houses or via Internet', 'admin@gmail.com', '2023-11-17 00:00:00'),
(86, 1, 6, '47.99 Other retail sale not in stores, stalls or markets', 'admin@gmail.com', '2023-11-18 00:00:00'),
(87, 1, 6, '45.31 Wholesale trade of motor vehicle parts and accessories', 'admin@gmail.com', '2023-11-19 00:00:00'),
(88, 1, 6, '46.15 Agents involved in the sale of furniture, household goods, hardware and ironmongery', 'admin@gmail.com', '2023-11-20 00:00:00'),
(89, 1, 6, '46.16 Agents involved in the sale of textiles, clothing, fur, footwear and leather goods', 'admin@gmail.com', '2023-11-21 00:00:00'),
(90, 1, 6, '46.22 Wholesale of flowers and plants', 'admin@gmail.com', '2023-11-22 00:00:00'),
(91, 1, 6, '46.24 Wholesale of hides, skins and leather', 'admin@gmail.com', '2023-11-23 00:00:00'),
(92, 1, 6, '46.35 Wholesale of tobacco products', 'admin@gmail.com', '2023-11-24 00:00:00'),
(93, 1, 6, '46.41 Wholesale of textiles', 'admin@gmail.com', '2023-11-25 00:00:00'),
(94, 1, 6, '46.42 Wholesale of clothing and footwear', 'admin@gmail.com', '2023-11-26 00:00:00'),
(95, 1, 6, '46.43 Wholesale of electrical household appliances', 'admin@gmail.com', '2023-11-27 00:00:00'),
(96, 1, 6, '46.44 Wholesale of china and glassware and cleaning materials', 'admin@gmail.com', '2023-11-28 00:00:00'),
(97, 1, 6, '46.45 Wholesale of perfume and cosmetics', 'admin@gmail.com', '2023-11-29 00:00:00'),
(98, 1, 6, '46.47 Wholesale of furniture, carpets and lighting equipment', 'admin@gmail.com', '2023-11-30 00:00:00'),
(99, 1, 6, '46.48 Wholesale of watches and jewellery', 'admin@gmail.com', '2023-12-01 00:00:00'),
(100, 1, 6, '46.49 Wholesale of other household goods', 'admin@gmail.com', '2023-12-02 00:00:00'),
(101, 1, 7, '30.12 Building of pleasure and sporting boats', 'admin@gmail.com', '2023-12-03 00:00:00'),
(102, 1, 7, '30.92 Manufacture of bicycles and invalid carriages', 'admin@gmail.com', '2023-12-04 00:00:00'),
(103, 1, 7, '32.2 Manufacture of musical instruments', 'admin@gmail.com', '2023-12-05 00:00:00'),
(104, 1, 7, '32.3 Manufacture of sports goods', 'admin@gmail.com', '2023-12-06 00:00:00'),
(105, 1, 7, '32.4 Manufacture of games and toys', 'admin@gmail.com', '2023-12-07 00:00:00'),
(106, 2, 8, '5.1 Mining of hard coal', 'admin@gmail.com', '2023-12-08 00:00:00'),
(107, 2, 8, '5.2 Mining of lignite', 'admin@gmail.com', '2023-12-09 00:00:00'),
(108, 2, 8, '7.21 Mining of uranium and thorium ores', 'admin@gmail.com', '2023-12-10 00:00:00'),
(109, 2, 8, '8.92 Extraction of peat', 'admin@gmail.com', '2023-12-11 00:00:00'),
(110, 2, 8, '19.1 Manufacture of coke oven products', 'admin@gmail.com', '2023-12-12 00:00:00'),
(111, 2, 8, '24.46 Processing of nuclear fuel', 'admin@gmail.com', '2023-12-13 00:00:00'),
(112, 2, 9, '8.11 Quarrying of ornamental and building stone, limestone, gypsum, chalk and slate', 'admin@gmail.com', '2023-12-14 00:00:00'),
(113, 2, 9, '8.12 Operation of gravel and sand pits; mining of clays and kaolin', 'admin@gmail.com', '2023-12-15 00:00:00'),
(114, 2, 9, '23.11 Manufacture of flat glass', 'admin@gmail.com', '2023-12-16 00:00:00'),
(115, 2, 9, '23.12 Shaping and processing of flat glass', 'admin@gmail.com', '2023-12-17 00:00:00'),
(116, 2, 9, '23.2 Manufacture of refractory products', 'admin@gmail.com', '2023-12-18 00:00:00'),
(117, 2, 9, '23.31 Manufacture of ceramic tiles and flags', 'admin@gmail.com', '2023-12-19 00:00:00'),
(118, 2, 9, '23.32 Manufacture of bricks, tiles and construction products, in baked clay', 'admin@gmail.com', '2023-12-20 00:00:00'),
(119, 2, 9, '23.51 Manufacture of cement', 'admin@gmail.com', '2023-12-21 00:00:00'),
(120, 2, 9, '23.52 Manufacture of lime and plaster', 'admin@gmail.com', '2023-12-22 00:00:00'),
(121, 2, 9, '23.61 Manufacture of concrete products for construction purposes', 'admin@gmail.com', '2023-12-23 00:00:00'),
(122, 2, 9, '23.62 Manufacture of plaster products for construction purposes', 'admin@gmail.com', '2023-12-24 00:00:00'),
(123, 2, 9, '23.63 Manufacture of ready-mixed concrete', 'admin@gmail.com', '2023-12-25 00:00:00'),
(124, 2, 9, '23.64 Manufacture of mortars', 'admin@gmail.com', '2023-12-26 00:00:00'),
(125, 2, 9, '23.65 Manufacture of fibre cement', 'admin@gmail.com', '2023-12-27 00:00:00'),
(126, 2, 9, '23.69 Manufacture of other articles of concrete, plaster and cement', 'admin@gmail.com', '2023-12-28 00:00:00'),
(127, 2, 9, '23.7 Cutting, shaping and finishing of stone', 'admin@gmail.com', '2023-12-29 00:00:00'),
(128, 2, 9, '23.91 Production of abrasive products', 'admin@gmail.com', '2023-12-30 00:00:00'),
(129, 2, 9, '23.99 Manufacture of other non-metallic mineral products n.e.c.', 'admin@gmail.com', '2023-12-31 00:00:00'),
(130, 2, 10, '7.1 Mining of iron ores', 'admin@gmail.com', '2024-01-01 00:00:00'),
(131, 2, 10, '24.1 Manufacture of basic iron and steel and of ferro-alloys', 'admin@gmail.com', '2024-01-02 00:00:00'),
(132, 2, 10, '24.2 Manufacture of tubes, pipes, hollow profiles and related fittings, of steel', 'admin@gmail.com', '2024-01-03 00:00:00'),
(133, 2, 10, '24.31 Cold drawing of bars', 'admin@gmail.com', '2024-01-04 00:00:00'),
(134, 2, 10, '24.32 Cold rolling of narrow strip', 'admin@gmail.com', '2024-01-05 00:00:00'),
(135, 2, 10, '24.33 Cold forming or folding', 'admin@gmail.com', '2024-01-06 00:00:00'),
(136, 2, 10, '24.34 Cold drawing of wire', 'admin@gmail.com', '2024-01-07 00:00:00'),
(137, 2, 10, '24.51 Casting of iron', 'admin@gmail.com', '2024-01-08 00:00:00'),
(138, 2, 10, '24.52 Casting of steel', 'admin@gmail.com', '2024-01-09 00:00:00'),
(139, 2, 11, '7.29 Mining of other non-ferrous metal ores', 'admin@gmail.com', '2024-01-10 00:00:00'),
(140, 2, 11, '7.29 Mining of other non-ferrous metal ores', 'admin@gmail.com', '2024-01-11 00:00:00'),
(141, 2, 11, '7.29 Mining of other non-ferrous metal ores', 'admin@gmail.com', '2024-01-12 00:00:00'),
(142, 2, 11, '8.93 Extraction of salt', 'admin@gmail.com', '2024-01-13 00:00:00'),
(143, 2, 11, '8.99 Other mining and quarrying n.e.c.', 'admin@gmail.com', '2024-01-14 00:00:00'),
(144, 2, 11, '9.9 Support activities for other mining and quarrying', 'admin@gmail.com', '2024-01-15 00:00:00'),
(145, 2, 11, '24.41 Precious metals production', 'admin@gmail.com', '2024-01-16 00:00:00'),
(146, 2, 11, '24.41 Precious metals production', 'admin@gmail.com', '2024-01-17 00:00:00'),
(147, 2, 11, '24.41 Precious metals production', 'admin@gmail.com', '2024-01-18 00:00:00'),
(148, 2, 11, '24.42 Aluminium production', 'admin@gmail.com', '2024-01-19 00:00:00'),
(149, 2, 11, '24.43 Lead, zinc and tin production', 'admin@gmail.com', '2024-01-20 00:00:00'),
(150, 2, 11, '24.44 Copper production', 'admin@gmail.com', '2024-01-21 00:00:00'),
(151, 2, 11, '24.45 Other non-ferrous metal production', 'admin@gmail.com', '2024-01-22 00:00:00'),
(152, 2, 11, '24.53 Casting of light metals', 'admin@gmail.com', '2024-01-23 00:00:00'),
(153, 2, 11, '24.54 Casting of other non-ferrous metals', 'admin@gmail.com', '2024-01-24 00:00:00'),
(154, 2, 11, '25.5 Forging, pressing, stamping and roll-forming of metal; powder metallurgy', 'admin@gmail.com', '2024-01-25 00:00:00'),
(155, 2, 11, '25.61 Treatment and coating of metals', 'admin@gmail.com', '2024-01-26 00:00:00'),
(156, 2, 11, '25.99 Manufacture of other fabricated metal products n.e.c.', 'admin@gmail.com', '2024-01-27 00:00:00'),
(157, 2, 11, '32.11 Striking of coins', 'admin@gmail.com', '2024-01-28 00:00:00'),
(158, 2, 12, '6.1 Extraction of crude petroleum', 'admin@gmail.com', '2024-01-29 00:00:00'),
(159, 2, 12, '6.2 Extraction of natural gas', 'admin@gmail.com', '2024-01-30 00:00:00'),
(160, 2, 12, '35.21 Manufacture of gas', 'admin@gmail.com', '2024-01-31 00:00:00'),
(161, 2, 13, '46.71 Wholesale of solid, liquid and gaseous fuels and related products', 'admin@gmail.com', '2024-02-01 00:00:00'),
(162, 2, 13, '49.5 Transport via pipeline', 'admin@gmail.com', '2024-02-02 00:00:00'),
(163, 2, 14, '19.2 Manufacture of refined petroleum products', 'admin@gmail.com', '2024-02-03 00:00:00'),
(164, 2, 15, '9.1 Support activities for petroleum and natural gas extraction', 'admin@gmail.com', '2024-02-04 00:00:00'),
(165, 2, 15, '9.1 Support activities for petroleum and natural gas extraction', 'admin@gmail.com', '2024-02-05 00:00:00'),
(166, 4, 23, '1.11 Growing of cereals (except rice), leguminous crops and oil seeds', 'admin@gmail.com', '2024-02-13 00:00:00'),
(167, 4, 23, '1.12 Growing of rice', 'admin@gmail.com', '2024-02-14 00:00:00'),
(168, 4, 23, '1.13 Growing of vegetables and melons, roots and tubers', 'admin@gmail.com', '2024-02-15 00:00:00'),
(169, 4, 23, '1.14 Growing of sugar cane', 'admin@gmail.com', '2024-02-16 00:00:00'),
(170, 4, 23, '1.15 Growing of tobacco', 'admin@gmail.com', '2024-02-17 00:00:00'),
(171, 4, 23, '1.16 Growing of fibre crops', 'admin@gmail.com', '2024-02-18 00:00:00'),
(172, 4, 23, '1.19 Growing of other non-perennial crops', 'admin@gmail.com', '2024-02-19 00:00:00'),
(173, 4, 23, '1.21 Growing of grapes', 'admin@gmail.com', '2024-02-20 00:00:00'),
(174, 4, 23, '1.22 Growing of tropical and subtropical fruits', 'admin@gmail.com', '2024-02-21 00:00:00'),
(175, 4, 23, '1.23 Growing of citrus fruits', 'admin@gmail.com', '2024-02-22 00:00:00'),
(176, 4, 23, '1.24 Growing of pome fruits and stone fruits', 'admin@gmail.com', '2024-02-23 00:00:00'),
(177, 4, 23, '1.25 Growing of other tree and bush fruits and nuts', 'admin@gmail.com', '2024-02-24 00:00:00'),
(178, 4, 23, '1.26 Growing of oleaginous fruits', 'admin@gmail.com', '2024-02-25 00:00:00'),
(179, 4, 23, '1.27 Growing of beverage crops', 'admin@gmail.com', '2024-02-26 00:00:00'),
(180, 4, 23, '1.28 Growing of spices, aromatic, drug and pharmaceutical crops', 'admin@gmail.com', '2024-02-27 00:00:00'),
(181, 4, 23, '1.29 Growing of other perennial crops', 'admin@gmail.com', '2024-02-28 00:00:00'),
(182, 4, 23, '1.3 Plant propagation', 'admin@gmail.com', '2024-02-29 00:00:00'),
(183, 4, 23, '1.41 Raising of dairy cattle', 'admin@gmail.com', '2024-03-01 00:00:00'),
(184, 4, 23, '1.43 Raising of horses and other equines', 'admin@gmail.com', '2024-03-02 00:00:00'),
(185, 4, 23, '1.44 Raising of camels and camelids', 'admin@gmail.com', '2024-03-03 00:00:00'),
(186, 4, 23, '1.45 Raising of sheep and goats', 'admin@gmail.com', '2024-03-04 00:00:00'),
(187, 4, 23, '1.49 Raising of other animals', 'admin@gmail.com', '2024-03-05 00:00:00'),
(188, 4, 23, '1.5 Mixed farming', 'admin@gmail.com', '2024-03-06 00:00:00'),
(189, 4, 23, '1.61 Support activities for crop production', 'admin@gmail.com', '2024-03-07 00:00:00'),
(190, 4, 23, '1.62 Support activities for animal production', 'admin@gmail.com', '2024-03-08 00:00:00'),
(191, 4, 23, '1.63 Post-harvest crop activities', 'admin@gmail.com', '2024-03-09 00:00:00'),
(192, 4, 23, '1.64 Seed processing for propagation', 'admin@gmail.com', '2024-03-10 00:00:00'),
(193, 4, 23, '2.3 Gathering of wild growing non-wood products', 'admin@gmail.com', '2024-03-11 00:00:00'),
(194, 4, 23, '10.91 Manufacture of prepared feeds for farm animals', 'admin@gmail.com', '2024-03-12 00:00:00'),
(195, 4, 23, '46.11 Agents involved in the sale of agricultural raw materials, live animals, textile raw materials', 'admin@gmail.com', '2024-03-13 00:00:00'),
(196, 4, 23, '46.23 Wholesale of live animals', 'admin@gmail.com', '2024-03-14 00:00:00'),
(197, 4, 24, '11.01 Distilling, rectifying and blending of spirits', 'admin@gmail.com', '2024-03-15 00:00:00'),
(198, 4, 24, '11.02 Manufacture of wine from grape', 'admin@gmail.com', '2024-03-16 00:00:00'),
(199, 4, 24, '11.03 Manufacture of cider and other fruit wines', 'admin@gmail.com', '2024-03-17 00:00:00'),
(200, 4, 24, '11.04 Manufacture of other non-distilled fermented beverages', 'admin@gmail.com', '2024-03-18 00:00:00'),
(201, 4, 24, '11.05 Manufacture of beer', 'admin@gmail.com', '2024-03-19 00:00:00'),
(202, 4, 24, '11.06 Manufacture of malt', 'admin@gmail.com', '2024-03-20 00:00:00'),
(203, 4, 25, '46.17 Agents involved in the sale of food, beverages and tobacco', 'admin@gmail.com', '2024-03-21 00:00:00'),
(204, 4, 25, '46.21 Wholesale of grain, unmanufactured tobacco, seeds and animal feeds', 'admin@gmail.com', '2024-03-22 00:00:00'),
(205, 4, 25, '46.31 Wholesale of fruit and vegetables', 'admin@gmail.com', '2024-03-23 00:00:00'),
(206, 4, 25, '46.32 Wholesale of meat and meat products', 'admin@gmail.com', '2024-03-24 00:00:00'),
(207, 4, 25, '46.33 Wholesale of dairy products, eggs and edible oils and fats', 'admin@gmail.com', '2024-03-25 00:00:00'),
(208, 4, 25, '46.34 Wholesale of beverages', 'admin@gmail.com', '2024-03-26 00:00:00'),
(209, 4, 25, '46.36 Wholesale of sugar and chocolate and sugar confectionery', 'admin@gmail.com', '2024-03-27 00:00:00'),
(210, 4, 25, '46.37 Wholesale of coffee, tea, cocoa and spices', 'admin@gmail.com', '2024-03-28 00:00:00'),
(211, 4, 25, '46.38 Wholesale of other food, including fish, crustaceans and molluscs', 'admin@gmail.com', '2024-03-29 00:00:00'),
(212, 4, 25, '46.39 Non-specialised wholesale of food, beverages and tobacco', 'admin@gmail.com', '2024-03-30 00:00:00'),
(213, 4, 25, '47.21 Retail sale of fruit and vegetables in specialised stores', 'admin@gmail.com', '2024-03-31 00:00:00'),
(214, 4, 25, '47.22 Retail sale of meat and meat products in specialised stores', 'admin@gmail.com', '2024-04-01 00:00:00'),
(215, 4, 25, '47.23 Retail sale of fish, crustaceans and molluscs in specialised stores', 'admin@gmail.com', '2024-04-02 00:00:00'),
(216, 4, 25, '47.24 Retail sale of bread, cakes, flour confectionery and sugar confectionery in specialised stores', 'admin@gmail.com', '2024-04-03 00:00:00'),
(217, 4, 25, '47.25 Retail sale of beverages in specialised stores', 'admin@gmail.com', '2024-04-04 00:00:00'),
(218, 4, 25, '47.26 Retail sale of tobacco products in specialised stores', 'admin@gmail.com', '2024-04-05 00:00:00'),
(219, 4, 25, '47.29 Other retail sale of food in specialised stores', 'admin@gmail.com', '2024-04-06 00:00:00'),
(220, 4, 25, '47.11 Retail sale in non-specialised stores with food, beverages or tobacco predominating', 'admin@gmail.com', '2024-04-07 00:00:00'),
(221, 4, 26, '1.42 Raising of other cattle and buffaloes', 'admin@gmail.com', '2024-04-08 00:00:00'),
(222, 4, 26, '1.46 Raising of swine/pigs', 'admin@gmail.com', '2024-04-09 00:00:00'),
(223, 4, 26, '1.47 Raising of poultry', 'admin@gmail.com', '2024-04-10 00:00:00'),
(224, 4, 26, '1.7 Hunting, trapping and related service activities', 'admin@gmail.com', '2024-04-11 00:00:00'),
(225, 4, 26, '3.11 Marine fishing', 'admin@gmail.com', '2024-04-12 00:00:00'),
(226, 4, 26, '3.12 Freshwater fishing', 'admin@gmail.com', '2024-04-13 00:00:00'),
(227, 4, 26, '3.21 Marine aquaculture', 'admin@gmail.com', '2024-04-14 00:00:00'),
(228, 4, 26, '3.22 Freshwater aquaculture', 'admin@gmail.com', '2024-04-15 00:00:00'),
(229, 4, 26, '10.11 Processing and preserving of meat', 'admin@gmail.com', '2024-04-16 00:00:00'),
(230, 4, 26, '10.12 Processing and preserving of poultry meat', 'admin@gmail.com', '2024-04-17 00:00:00'),
(231, 4, 26, '10.13 Production of meat and poultry meat products', 'admin@gmail.com', '2024-04-18 00:00:00'),
(232, 4, 26, '10.2 Processing and preserving of fish, crustaceans and molluscs', 'admin@gmail.com', '2024-04-19 00:00:00'),
(233, 4, 27, '11.07 Manufacture of soft drinks; production of mineral waters and other bottled waters', 'admin@gmail.com', '2024-04-20 00:00:00'),
(234, 4, 28, '10.31 Processing and preserving of potatoes', 'admin@gmail.com', '2024-04-21 00:00:00'),
(235, 4, 28, '10.32 Manufacture of fruit and vegetable juice', 'admin@gmail.com', '2024-04-22 00:00:00'),
(236, 4, 28, '10.39 Other processing and preserving of fruit and vegetables', 'admin@gmail.com', '2024-04-23 00:00:00'),
(237, 4, 28, '10.41 Manufacture of oils and fats', 'admin@gmail.com', '2024-04-24 00:00:00'),
(238, 4, 28, '10.42 Manufacture of margarine and similar edible fats', 'admin@gmail.com', '2024-04-25 00:00:00'),
(239, 4, 28, '10.51 Operation of dairies and cheese making', 'admin@gmail.com', '2024-04-26 00:00:00'),
(240, 4, 28, '10.52 Manufacture of ice cream', 'admin@gmail.com', '2024-04-27 00:00:00'),
(241, 4, 28, '10.61 Manufacture of grain mill products', 'admin@gmail.com', '2024-04-28 00:00:00'),
(242, 4, 28, '10.62 Manufacture of starches and starch products', 'admin@gmail.com', '2024-04-29 00:00:00'),
(243, 4, 28, '10.71 Manufacture of bread; manufacture of fresh pastry goods and cakes', 'admin@gmail.com', '2024-04-30 00:00:00'),
(244, 4, 28, '10.72 Manufacture of rusks and biscuits; manufacture of preserved pastry goods and cakes', 'admin@gmail.com', '2024-05-01 00:00:00'),
(245, 4, 28, '10.73 Manufacture of macaroni, noodles, couscous and similar farinaceous products', 'admin@gmail.com', '2024-05-02 00:00:00'),
(246, 4, 28, '10.81 Manufacture of sugar', 'admin@gmail.com', '2024-05-03 00:00:00'),
(247, 4, 28, '10.82 Manufacture of cocoa, chocolate and sugar confectionery', 'admin@gmail.com', '2024-05-04 00:00:00'),
(248, 4, 28, '10.83 Processing of tea and coffee', 'admin@gmail.com', '2024-05-05 00:00:00'),
(249, 4, 28, '10.84 Manufacture of condiments and seasonings', 'admin@gmail.com', '2024-05-06 00:00:00'),
(250, 4, 28, '10.85 Manufacture of prepared meals and dishes', 'admin@gmail.com', '2024-05-07 00:00:00'),
(251, 4, 28, '10.86 Manufacture of homogenised food preparations and dietetic food', 'admin@gmail.com', '2024-05-08 00:00:00'),
(252, 4, 28, '10.89 Manufacture of other food products n.e.c.', 'admin@gmail.com', '2024-05-09 00:00:00'),
(253, 4, 28, '10.92 Manufacture of prepared pet foods', 'admin@gmail.com', '2024-05-10 00:00:00'),
(254, 4, 29, '56.1 Restaurants and mobile food service activities', 'admin@gmail.com', '2024-05-11 00:00:00'),
(255, 4, 29, '56.21 Event catering activities', 'admin@gmail.com', '2024-05-12 00:00:00'),
(256, 4, 29, '56.29 Other food service activities', 'admin@gmail.com', '2024-05-13 00:00:00'),
(257, 4, 29, '56.3 Beverage serving activities', 'admin@gmail.com', '2024-05-14 00:00:00'),
(258, 4, 30, '12 Manufacture of tobacco products', 'admin@gmail.com', '2024-05-15 00:00:00'),
(259, 5, 32, '47.73 Dispensing chemist in specialised stores', 'admin@gmail.com', '2024-05-17 00:00:00'),
(260, 6, 43, '37 Sewerage', 'admin@gmail.com', '2024-05-28 00:00:00'),
(261, 6, 43, '38.11 Collection of non-hazardous waste', 'admin@gmail.com', '2024-05-29 00:00:00'),
(262, 6, 43, '38.12 Collection of hazardous waste', 'admin@gmail.com', '2024-05-30 00:00:00'),
(263, 6, 43, '38.21 Treatment and disposal of non-hazardous waste', 'admin@gmail.com', '2024-05-31 00:00:00'),
(264, 6, 43, '38.22 Treatment and disposal of hazardous waste', 'admin@gmail.com', '2024-06-01 00:00:00'),
(265, 6, 43, '38.31 Dismantling of wrecks', 'admin@gmail.com', '2024-06-02 00:00:00'),
(266, 6, 43, '38.32 Recovery of sorted materials', 'admin@gmail.com', '2024-06-03 00:00:00'),
(267, 6, 43, '39 Remediation activities and other waste management services', 'admin@gmail.com', '2024-06-04 00:00:00'),
(268, 6, 43, '81.1 Combined facilities support activities', 'admin@gmail.com', '2024-06-05 00:00:00'),
(269, 6, 43, '81.21 General cleaning of buildings', 'admin@gmail.com', '2024-06-06 00:00:00'),
(270, 6, 43, '81.29 Other cleaning activities', 'admin@gmail.com', '2024-06-07 00:00:00'),
(271, 6, 43, '81.3 Landscape service activities', 'admin@gmail.com', '2024-06-08 00:00:00'),
(272, 8, 51, '25.4 Manufacture of weapons and ammunition', 'admin@gmail.com', '2024-06-16 00:00:00'),
(273, 8, 51, '30.3 Manufacture of air and spacecraft and related machinery', 'admin@gmail.com', '2024-06-17 00:00:00'),
(274, 8, 51, '30.4 Manufacture of military fighting vehicles', 'admin@gmail.com', '2024-06-18 00:00:00'),
(275, 8, 51, '33.16 Repair and maintenance of aircraft and spacecraft', 'admin@gmail.com', '2024-06-19 00:00:00'),
(276, 8, 51, '51.22 Space transport', 'admin@gmail.com', '2024-06-20 00:00:00'),
(277, 8, 51, '84.22 Defence activities', 'admin@gmail.com', '2024-06-21 00:00:00'),
(278, 8, 52, '8.91 Mining of chemical and fertiliser minerals', 'admin@gmail.com', '2024-06-22 00:00:00'),
(279, 8, 52, '20.11 Manufacture of industrial gases', 'admin@gmail.com', '2024-06-23 00:00:00'),
(280, 8, 52, '20.12 Manufacture of dyes and pigments', 'admin@gmail.com', '2024-06-24 00:00:00'),
(281, 8, 52, '20.13 Manufacture of other inorganic basic chemicals', 'admin@gmail.com', '2024-06-25 00:00:00'),
(282, 8, 52, '20.14 Manufacture of other organic basic chemicals', 'admin@gmail.com', '2024-06-26 00:00:00'),
(283, 8, 52, '20.15 Manufacture of fertilisers and nitrogen compounds', 'admin@gmail.com', '2024-06-27 00:00:00'),
(284, 8, 52, '20.16 Manufacture of plastics in primary forms', 'admin@gmail.com', '2024-06-28 00:00:00'),
(285, 8, 52, '20.17 Manufacture of synthetic rubber in primary forms', 'admin@gmail.com', '2024-06-29 00:00:00'),
(286, 8, 52, '20.2 Manufacture of pesticides and other agrochemical products', 'admin@gmail.com', '2024-06-30 00:00:00'),
(287, 8, 52, '20.3 Manufacture of paints, varnishes and similar coatings, printing ink and mastics', 'admin@gmail.com', '2024-07-01 00:00:00'),
(288, 8, 52, '20.51 Manufacture of explosives', 'admin@gmail.com', '2024-07-02 00:00:00'),
(289, 8, 52, '20.52 Manufacture of glues', 'admin@gmail.com', '2024-07-03 00:00:00'),
(290, 8, 52, '20.53 Manufacture of essential oils', 'admin@gmail.com', '2024-07-04 00:00:00'),
(291, 8, 52, '20.59 Manufacture of other chemical products n.e.c.', 'admin@gmail.com', '2024-07-05 00:00:00'),
(292, 8, 52, '20.6 Manufacture of man-made fibres', 'admin@gmail.com', '2024-07-06 00:00:00'),
(293, 8, 52, '22.19 Manufacture of other rubber products', 'admin@gmail.com', '2024-07-07 00:00:00'),
(294, 8, 52, '22.21 Manufacture of plastic plates, sheets, tubes and profiles', 'admin@gmail.com', '2024-07-08 00:00:00'),
(295, 8, 52, '23.14 Manufacture of glass fibres', 'admin@gmail.com', '2024-07-09 00:00:00'),
(296, 8, 53, '16.24 Manufacture of wooden containers', 'admin@gmail.com', '2024-07-10 00:00:00'),
(297, 8, 53, '17.21 Manufacture of corrugated paper and paperboard and of containers of paper and paperboard', 'admin@gmail.com', '2024-07-11 00:00:00'),
(298, 8, 53, '22.22 Manufacture of plastic packing goods', 'admin@gmail.com', '2024-07-12 00:00:00'),
(299, 8, 53, '23.13 Manufacture of hollow glass', 'admin@gmail.com', '2024-07-13 00:00:00'),
(300, 8, 53, '23.19 Manufacture and processing of other glass, including technical glassware', 'admin@gmail.com', '2024-07-14 00:00:00'),
(301, 8, 53, '25.91 Manufacture of steel drums and similar containers', 'admin@gmail.com', '2024-07-15 00:00:00'),
(302, 8, 54, '23.43 Manufacture of ceramic insulators and insulating fittings', 'admin@gmail.com', '2024-07-16 00:00:00'),
(303, 8, 54, '23.44 Manufacture of other technical ceramic products', 'admin@gmail.com', '2024-07-17 00:00:00'),
(304, 8, 54, '25.3 Manufacture of steam generators, except central heating hot water boilers', 'admin@gmail.com', '2024-07-18 00:00:00'),
(305, 8, 54, '26.12 Manufacture of loaded electronic boards', 'admin@gmail.com', '2024-07-19 00:00:00'),
(306, 8, 54, '26.51 Manufacture of instruments and appliances for measuring, testing and navigation', 'admin@gmail.com', '2024-07-20 00:00:00'),
(307, 8, 54, '26.7 Manufacture of optical instruments and photographic equipment', 'admin@gmail.com', '2024-07-21 00:00:00'),
(308, 8, 54, '27.11 Manufacture of electric motors, generators and transformers', 'admin@gmail.com', '2024-07-22 00:00:00'),
(309, 8, 54, '27.12 Manufacture of electricity distribution and control apparatus', 'admin@gmail.com', '2024-07-23 00:00:00'),
(310, 8, 54, '27.2 Manufacture of batteries and accumulators', 'admin@gmail.com', '2024-07-24 00:00:00'),
(311, 8, 54, '27.32 Manufacture of other electronic and electric wires and cables', 'admin@gmail.com', '2024-07-25 00:00:00'),
(312, 8, 54, '27.33 Manufacture of wiring devices', 'admin@gmail.com', '2024-07-26 00:00:00'),
(313, 8, 54, '27.4 Manufacture of electric lighting equipment', 'admin@gmail.com', '2024-07-27 00:00:00'),
(314, 8, 54, '27.9 Manufacture of other electrical equipment', 'admin@gmail.com', '2024-07-28 00:00:00'),
(315, 8, 54, '28.11 Manufacture of engines and turbines, except aircraft, vehicle and cycle engines', 'admin@gmail.com', '2024-07-29 00:00:00'),
(316, 8, 55, '16.23 Manufacture of other builders\' carpentry and joinery', 'admin@gmail.com', '2024-07-30 00:00:00'),
(317, 8, 55, '22.23 Manufacture of builders’ ware of plastic', 'admin@gmail.com', '2024-07-31 00:00:00'),
(318, 8, 55, '23.42 Manufacture of ceramic sanitary fixtures', 'admin@gmail.com', '2024-08-01 00:00:00'),
(319, 8, 55, '25.11 Manufacture of metal structures and parts of structures', 'admin@gmail.com', '2024-08-02 00:00:00'),
(320, 8, 55, '25.12 Manufacture of doors and windows of metal', 'admin@gmail.com', '2024-08-03 00:00:00'),
(321, 8, 55, '25.21 Manufacture of central heating radiators and boilers', 'admin@gmail.com', '2024-08-04 00:00:00'),
(322, 8, 55, '25.29 Manufacture of other tanks, reservoirs and containers of metal', 'admin@gmail.com', '2024-08-05 00:00:00'),
(323, 8, 55, '25.62 Machining', 'admin@gmail.com', '2024-08-06 00:00:00'),
(324, 8, 55, '25.72 Manufacture of locks and hinges', 'admin@gmail.com', '2024-08-07 00:00:00'),
(325, 8, 55, '25.73 Manufacture of tools', 'admin@gmail.com', '2024-08-08 00:00:00'),
(326, 8, 55, '25.92 Manufacture of light metal packaging', 'admin@gmail.com', '2024-08-09 00:00:00'),
(327, 8, 55, '25.93 Manufacture of wire products, chain and springs', 'admin@gmail.com', '2024-08-10 00:00:00'),
(328, 8, 55, '25.94 Manufacture of fasteners and screw machine products', 'admin@gmail.com', '2024-08-11 00:00:00'),
(329, 8, 55, '28.12 Manufacture of fluid power equipment', 'admin@gmail.com', '2024-08-12 00:00:00'),
(330, 8, 55, '28.13 Manufacture of other pumps and compressors', 'admin@gmail.com', '2024-08-13 00:00:00'),
(331, 8, 55, '28.14 Manufacture of other taps and valves', 'admin@gmail.com', '2024-08-14 00:00:00'),
(332, 8, 55, '28.15 Manufacture of bearings, gears, gearing and driving elements', 'admin@gmail.com', '2024-08-15 00:00:00'),
(333, 8, 55, '28.21 Manufacture of ovens, furnaces and furnace burners', 'admin@gmail.com', '2024-08-16 00:00:00'),
(334, 8, 55, '28.22 Manufacture of lifting and handling equipment', 'admin@gmail.com', '2024-08-17 00:00:00'),
(335, 8, 55, '28.25 Manufacture of non-domestic cooling and ventilation equipment', 'admin@gmail.com', '2024-08-18 00:00:00'),
(336, 8, 55, '28.29 Manufacture of other general-purpose machinery n.e.c.', 'admin@gmail.com', '2024-08-19 00:00:00'),
(337, 8, 55, '28.3 Manufacture of agricultural and forestry machinery', 'admin@gmail.com', '2024-08-20 00:00:00'),
(338, 8, 55, '28.41 Manufacture of metal forming machinery', 'admin@gmail.com', '2024-08-21 00:00:00'),
(339, 8, 55, '28.49 Manufacture of other machine tools', 'admin@gmail.com', '2024-08-22 00:00:00'),
(340, 8, 55, '28.91 Manufacture of machinery for metallurgy', 'admin@gmail.com', '2024-08-23 00:00:00'),
(341, 8, 55, '28.92 Manufacture of machinery for mining, quarrying and construction', 'admin@gmail.com', '2024-08-24 00:00:00'),
(342, 8, 55, '28.93 Manufacture of machinery for food, beverage and tobacco processing', 'admin@gmail.com', '2024-08-25 00:00:00'),
(343, 8, 55, '28.94 Manufacture of machinery for textile, apparel and leather production', 'admin@gmail.com', '2024-08-26 00:00:00'),
(344, 8, 55, '28.95 Manufacture of machinery for paper and paperboard production', 'admin@gmail.com', '2024-08-27 00:00:00'),
(345, 8, 55, '28.96 Manufacture of plastics and rubber machinery', 'admin@gmail.com', '2024-08-28 00:00:00'),
(346, 8, 55, '28.99 Manufacture of other special-purpose machinery n.e.c.', 'admin@gmail.com', '2024-08-29 00:00:00'),
(347, 8, 55, '29.2 Manufacture of bodies (coachwork) for motor vehicles; manufacture of trailers and semitrailers', 'admin@gmail.com', '2024-08-30 00:00:00'),
(348, 8, 55, '30.11 Building of ships and floating structures', 'admin@gmail.com', '2024-08-31 00:00:00'),
(349, 8, 55, '30.2 Manufacture of railway locomotives and rolling stock', 'admin@gmail.com', '2024-09-01 00:00:00'),
(350, 8, 55, '30.99 Manufacture of other transport equipment n.e.c.', 'admin@gmail.com', '2024-09-02 00:00:00'),
(351, 8, 55, '33.15 Repair and maintenance of ships and boats', 'admin@gmail.com', '2024-09-03 00:00:00'),
(352, 8, 55, '33.17 Repair and maintenance of other transport equipment', 'admin@gmail.com', '2024-09-04 00:00:00'),
(353, 8, 55, '42.11 Construction of roads and motorways', 'admin@gmail.com', '2024-09-05 00:00:00'),
(354, 8, 55, '42.12 Construction of railways and underground railways', 'admin@gmail.com', '2024-09-06 00:00:00'),
(355, 8, 55, '42.13 Construction of bridges and tunnels', 'admin@gmail.com', '2024-09-07 00:00:00'),
(356, 8, 55, '42.21 Construction of utility projects for fluids', 'admin@gmail.com', '2024-09-08 00:00:00'),
(357, 8, 55, '42.22 Construction of utility projects for electricity and telecommunications', 'admin@gmail.com', '2024-09-09 00:00:00'),
(358, 8, 55, '42.91 Construction of water projects', 'admin@gmail.com', '2024-09-10 00:00:00'),
(359, 8, 55, '42.99 Construction of other civil engineering projects n.e.c.', 'admin@gmail.com', '2024-09-11 00:00:00'),
(360, 8, 55, '43.11 Demolition', 'admin@gmail.com', '2024-09-12 00:00:00'),
(361, 8, 55, '43.12 Site preparation', 'admin@gmail.com', '2024-09-13 00:00:00'),
(362, 8, 55, '43.13 Test drilling and boring', 'admin@gmail.com', '2024-09-14 00:00:00'),
(363, 8, 55, '43.21 Electrical installation', 'admin@gmail.com', '2024-09-15 00:00:00'),
(364, 8, 55, '43.22 Plumbing, heat and air-conditioning installation', 'admin@gmail.com', '2024-09-16 00:00:00'),
(365, 8, 55, '43.29 Other construction installation', 'admin@gmail.com', '2024-09-17 00:00:00'),
(366, 8, 55, '43.31 Plastering', 'admin@gmail.com', '2024-09-18 00:00:00'),
(367, 8, 55, '43.32 Joinery installation', 'admin@gmail.com', '2024-09-19 00:00:00'),
(368, 8, 55, '43.33 Floor and wall covering', 'admin@gmail.com', '2024-09-20 00:00:00'),
(369, 8, 55, '43.34 Painting and glazing', 'admin@gmail.com', '2024-09-21 00:00:00'),
(370, 8, 55, '43.39 Other building completion and finishing', 'admin@gmail.com', '2024-09-22 00:00:00'),
(371, 8, 55, '43.91 Roofing activities', 'admin@gmail.com', '2024-09-23 00:00:00'),
(372, 8, 55, '43.99 Other specialised construction activities n.e.c.', 'admin@gmail.com', '2024-09-24 00:00:00'),
(373, 8, 55, '46.12 Agents involved in the sale of fuels, ores, metals and industrial chemicals', 'admin@gmail.com', '2024-09-25 00:00:00'),
(374, 8, 55, '46.13 Agents involved in the sale of timber and building materials', 'admin@gmail.com', '2024-09-26 00:00:00'),
(375, 8, 55, '46.14 Agents involved in the sale of machinery, industrial equipment, ships and aircraft', 'admin@gmail.com', '2024-09-27 00:00:00'),
(376, 8, 55, '46.18 Agents specialised in the sale of other particular products', 'admin@gmail.com', '2024-09-28 00:00:00'),
(377, 8, 55, '46.19 Agents involved in the sale of a variety of goods', 'admin@gmail.com', '2024-09-29 00:00:00'),
(378, 8, 55, '46.61 Wholesale of agricultural machinery, equipment and supplies', 'admin@gmail.com', '2024-09-30 00:00:00'),
(379, 8, 55, '46.62 Wholesale of machine tools', 'admin@gmail.com', '2024-10-01 00:00:00'),
(380, 8, 55, '46.63 Wholesale of mining, construction and civil engineering machinery', 'admin@gmail.com', '2024-10-02 00:00:00'),
(381, 8, 55, '46.64 Wholesale of machinery for the textile industry and of sewing and knitting machines', 'admin@gmail.com', '2024-10-03 00:00:00'),
(382, 8, 55, '46.69 Wholesale of other machinery and equipment', 'admin@gmail.com', '2024-10-04 00:00:00'),
(383, 8, 55, '46.72 Wholesale of metals and metal ores', 'admin@gmail.com', '2024-10-05 00:00:00'),
(384, 8, 55, '46.73 Wholesale of wood, construction materials and sanitary equipment', 'admin@gmail.com', '2024-10-06 00:00:00'),
(385, 8, 55, '46.74 Wholesale of hardware, plumbing and heating equipment and supplies', 'admin@gmail.com', '2024-10-07 00:00:00'),
(386, 8, 55, '46.75 Wholesale of chemical products', 'admin@gmail.com', '2024-10-08 00:00:00'),
(387, 8, 55, '46.76 Wholesale of other intermediate products', 'admin@gmail.com', '2024-10-09 00:00:00'),
(388, 8, 55, '46.77 Wholesale of waste and scrap', 'admin@gmail.com', '2024-10-10 00:00:00'),
(389, 8, 55, '46.9 Non-specialised wholesale trade', 'admin@gmail.com', '2024-10-11 00:00:00'),
(390, 8, 55, '64.2 Activities of holding companies', 'admin@gmail.com', '2024-10-12 00:00:00'),
(391, 8, 55, '71.12 Engineering activities and related technical consultancy', 'admin@gmail.com', '2024-10-13 00:00:00'),
(392, 8, 55, '77.31 Rental and leasing of agricultural machinery and equipment', 'admin@gmail.com', '2024-10-14 00:00:00'),
(393, 8, 55, '77.32 Rental and leasing of construction and civil engineering machinery and equipment', 'admin@gmail.com', '2024-10-15 00:00:00'),
(394, 8, 55, '77.35 Rental and leasing of air transport equipment', 'admin@gmail.com', '2024-10-16 00:00:00'),
(395, 8, 55, '77.39 Rental and leasing of other machinery, equipment and tangible goods n.e.c.', 'admin@gmail.com', '2024-10-17 00:00:00'),
(396, 9, 56, '70.21 Public relations and communication activities', 'admin@gmail.com', '2024-10-18 00:00:00'),
(397, 9, 56, '73.11 Advertising agencies', 'admin@gmail.com', '2024-10-19 00:00:00'),
(398, 9, 56, '73.12 Media representation', 'admin@gmail.com', '2024-10-20 00:00:00'),
(399, 9, 56, '73.2 Market research and public opinion polling', 'admin@gmail.com', '2024-10-21 00:00:00'),
(400, 9, 56, '82.3 Organisation of conventions and trade shows', 'admin@gmail.com', '2024-10-22 00:00:00'),
(401, 9, 57, '92 Gambling and betting activities', 'admin@gmail.com', '2024-10-23 00:00:00'),
(402, 9, 58, '85.1 Pre-primary education', 'admin@gmail.com', '2024-10-24 00:00:00'),
(403, 9, 58, '85.2 Primary education', 'admin@gmail.com', '2024-10-25 00:00:00'),
(404, 9, 58, '85.31 General secondary education', 'admin@gmail.com', '2024-10-26 00:00:00'),
(405, 9, 58, '85.32 Technical and vocational secondary education', 'admin@gmail.com', '2024-10-27 00:00:00'),
(406, 9, 58, '85.41 Post-secondary non-tertiary education', 'admin@gmail.com', '2024-10-28 00:00:00'),
(407, 9, 58, '85.42 Tertiary education', 'admin@gmail.com', '2024-10-29 00:00:00'),
(408, 9, 58, '85.51 Sports and recreation education', 'admin@gmail.com', '2024-10-30 00:00:00'),
(409, 9, 58, '85.52 Cultural education', 'admin@gmail.com', '2024-10-31 00:00:00'),
(410, 9, 58, '85.53 Driving school activities', 'admin@gmail.com', '2024-11-01 00:00:00'),
(411, 9, 58, '85.59 Other education n.e.c.', 'admin@gmail.com', '2024-11-02 00:00:00'),
(412, 9, 58, '85.6 Educational support activities', 'admin@gmail.com', '2024-11-03 00:00:00'),
(413, 9, 59, '55.1 Hotels and similar accommodation', 'admin@gmail.com', '2024-11-04 00:00:00'),
(414, 9, 59, '55.2 Holiday and other short-stay accommodation', 'admin@gmail.com', '2024-11-05 00:00:00'),
(415, 9, 59, '55.9 Other accommodation', 'admin@gmail.com', '2024-11-06 00:00:00'),
(416, 9, 59, '79.9 Other reservation service and related activities', 'admin@gmail.com', '2024-11-07 00:00:00'),
(417, 9, 60, '55.3 Camping grounds, recreational vehicle parks and trailer parks', 'admin@gmail.com', '2024-11-08 00:00:00'),
(418, 9, 60, '79.11 Travel agency activities', 'admin@gmail.com', '2024-11-09 00:00:00'),
(419, 9, 60, '79.12 Tour operator activities', 'admin@gmail.com', '2024-11-10 00:00:00'),
(420, 9, 60, '79.9 Other reservation service and related activities', 'admin@gmail.com', '2024-11-11 00:00:00'),
(421, 9, 61, '18.2 Reproduction of recorded media', 'admin@gmail.com', '2024-11-12 00:00:00'),
(422, 9, 61, '58.11 Book publishing', 'admin@gmail.com', '2024-11-13 00:00:00'),
(423, 9, 61, '58.12 Publishing of directories and mailing lists', 'admin@gmail.com', '2024-11-14 00:00:00'),
(424, 9, 61, '58.13 Publishing of newspapers', 'admin@gmail.com', '2024-11-15 00:00:00'),
(425, 9, 61, '58.14 Publishing of journals and periodicals', 'admin@gmail.com', '2024-11-16 00:00:00'),
(426, 9, 61, '58.19 Other publishing activities', 'admin@gmail.com', '2024-11-17 00:00:00'),
(427, 9, 61, '58.21 Publishing of computer games', 'admin@gmail.com', '2024-11-18 00:00:00'),
(428, 9, 61, '59.11 Motion picture, video and television programme production activities', 'admin@gmail.com', '2024-11-19 00:00:00'),
(429, 9, 61, '59.12 Motion picture, video and television programme post-production activities', 'admin@gmail.com', '2024-11-20 00:00:00'),
(430, 9, 61, '59.13 Motion picture, video and television programme distribution activities', 'admin@gmail.com', '2024-11-21 00:00:00'),
(431, 9, 61, '59.14 Motion picture projection activities', 'admin@gmail.com', '2024-11-22 00:00:00'),
(432, 9, 61, '59.2 Sound recording and music publishing activities', 'admin@gmail.com', '2024-11-23 00:00:00'),
(433, 9, 61, '60.1 Radio broadcasting', 'admin@gmail.com', '2024-11-24 00:00:00'),
(434, 9, 61, '60.2 Television programming and broadcasting activities', 'admin@gmail.com', '2024-11-25 00:00:00'),
(435, 9, 61, '60.2 Television programming and broadcasting activities', 'admin@gmail.com', '2024-11-26 00:00:00'),
(436, 9, 61, '63.12 Web portals', 'admin@gmail.com', '2024-11-27 00:00:00'),
(437, 9, 61, '63.91 News agency activities', 'admin@gmail.com', '2024-11-28 00:00:00'),
(438, 9, 61, '82.3 Organisation of conventions and trade shows', 'admin@gmail.com', '2024-11-29 00:00:00'),
(439, 9, 61, '90.01 Performing arts', 'admin@gmail.com', '2024-11-30 00:00:00'),
(440, 9, 61, '90.02 Support activities to performing arts', 'admin@gmail.com', '2024-12-01 00:00:00'),
(441, 9, 61, '90.03 Artistic creation', 'admin@gmail.com', '2024-12-02 00:00:00'),
(442, 9, 61, '93.12 Activities of sports clubs', 'admin@gmail.com', '2024-12-03 00:00:00'),
(443, 9, 61, '93.19 Other sports activities', 'admin@gmail.com', '2024-12-04 00:00:00'),
(444, 9, 62, '18.11 Printing of newspapers', 'admin@gmail.com', '2024-12-05 00:00:00'),
(445, 9, 62, '18.12 Other printing', 'admin@gmail.com', '2024-12-06 00:00:00'),
(446, 9, 62, '18.13 Pre-press and pre-media services', 'admin@gmail.com', '2024-12-07 00:00:00'),
(447, 9, 62, '18.14 Binding and related services', 'admin@gmail.com', '2024-12-08 00:00:00'),
(448, 9, 62, '28.23 Manufacture of office machinery and equipment (except computers and peripheral equipment)', 'admin@gmail.com', '2024-12-09 00:00:00'),
(449, 9, 62, '31.01 Manufacture of office and shop furniture', 'admin@gmail.com', '2024-12-10 00:00:00'),
(450, 9, 62, '33.11 Repair of fabricated metal products', 'admin@gmail.com', '2024-12-11 00:00:00'),
(451, 9, 62, '33.12 Repair of machinery', 'admin@gmail.com', '2024-12-12 00:00:00'),
(452, 9, 62, '33.13 Repair of electronic and optical equipment', 'admin@gmail.com', '2024-12-13 00:00:00'),
(453, 9, 62, '33.14 Repair of electrical equipment', 'admin@gmail.com', '2024-12-14 00:00:00'),
(454, 9, 62, '33.19 Repair of other equipment', 'admin@gmail.com', '2024-12-15 00:00:00'),
(455, 9, 62, '33.2 Installation of industrial machinery and equipment', 'admin@gmail.com', '2024-12-16 00:00:00'),
(456, 9, 62, '37 Sewerage', 'admin@gmail.com', '2024-12-17 00:00:00'),
(457, 9, 62, '38.11 Collection of non-hazardous waste', 'admin@gmail.com', '2024-12-18 00:00:00'),
(458, 9, 62, '38.12 Collection of hazardous waste', 'admin@gmail.com', '2024-12-19 00:00:00'),
(459, 9, 62, '38.21 Treatment and disposal of non-hazardous waste', 'admin@gmail.com', '2024-12-20 00:00:00'),
(460, 9, 62, '38.22 Treatment and disposal of hazardous waste', 'admin@gmail.com', '2024-12-21 00:00:00'),
(461, 9, 62, '38.31 Dismantling of wrecks', 'admin@gmail.com', '2024-12-22 00:00:00'),
(462, 9, 62, '38.32 Recovery of sorted materials', 'admin@gmail.com', '2024-12-23 00:00:00'),
(463, 9, 62, '39 Remediation activities and other waste management services', 'admin@gmail.com', '2024-12-24 00:00:00'),
(464, 9, 62, '45.2 Maintenance and repair of motor vehicles', 'admin@gmail.com', '2024-12-25 00:00:00'),
(465, 9, 62, '46.65 Wholesale of office furniture', 'admin@gmail.com', '2024-12-26 00:00:00'),
(466, 9, 62, '46.66 Wholesale of other office machinery and equipment', 'admin@gmail.com', '2024-12-27 00:00:00'),
(467, 9, 62, '52.1 Warehousing and storage', 'admin@gmail.com', '2024-12-28 00:00:00'),
(468, 9, 62, '63.11 Data processing, hosting and related activities', 'admin@gmail.com', '2024-12-29 00:00:00'),
(469, 9, 62, '63.99 Other information service activities n.e.c.', 'admin@gmail.com', '2024-12-30 00:00:00'),
(470, 9, 62, '69.1 Legal activities', 'admin@gmail.com', '2024-12-31 00:00:00'),
(471, 9, 62, '69.2 Accounting, bookkeeping and auditing activities; tax consultancy', 'admin@gmail.com', '2025-01-01 00:00:00'),
(472, 9, 62, '70.1 Activities of head offices', 'admin@gmail.com', '2025-01-02 00:00:00'),
(473, 9, 62, '70.22 Business and other management consultancy activities', 'admin@gmail.com', '2025-01-03 00:00:00'),
(474, 9, 62, '71.11 Architectural activities', 'admin@gmail.com', '2025-01-04 00:00:00'),
(475, 9, 62, '71.2 Technical testing and analysis', 'admin@gmail.com', '2025-01-05 00:00:00'),
(476, 9, 62, '72.19 Other research and experimental development on natural sciences and engineering', 'admin@gmail.com', '2025-01-06 00:00:00');
INSERT INTO `md_busi_act` (`id`, `sec_id`, `ind_id`, `busi_act_name`, `created_by`, `created_dt`) VALUES
(477, 9, 62, '72.2 Research and experimental development on social sciences and humanities', 'admin@gmail.com', '2025-01-07 00:00:00'),
(478, 9, 62, '74.1 Specialised design activities', 'admin@gmail.com', '2025-01-08 00:00:00'),
(479, 9, 62, '74.2 Photographic activities', 'admin@gmail.com', '2025-01-09 00:00:00'),
(480, 9, 62, '74.3 Translation and interpretation activities', 'admin@gmail.com', '2025-01-10 00:00:00'),
(481, 9, 62, '74.9 Other professional, scientific and technical activities n.e.c.', 'admin@gmail.com', '2025-01-11 00:00:00'),
(482, 9, 62, '77.33 Rental and leasing of office machinery and equipment (including computers)', 'admin@gmail.com', '2025-01-12 00:00:00'),
(483, 9, 62, '77.4 Leasing of intellectual property and similar products, except copyrighted works', 'admin@gmail.com', '2025-01-13 00:00:00'),
(484, 9, 62, '78.1 Activities of employment placement agencies', 'admin@gmail.com', '2025-01-14 00:00:00'),
(485, 9, 62, '78.2 Temporary employment agency activities', 'admin@gmail.com', '2025-01-15 00:00:00'),
(486, 9, 62, '78.3 Other human resources provision', 'admin@gmail.com', '2025-01-16 00:00:00'),
(487, 9, 62, '80.1 Private security activities', 'admin@gmail.com', '2025-01-17 00:00:00'),
(488, 9, 62, '80.2 Security systems service activities', 'admin@gmail.com', '2025-01-18 00:00:00'),
(489, 9, 62, '80.3 Investigation activities', 'admin@gmail.com', '2025-01-19 00:00:00'),
(490, 9, 62, '81.1 Combined facilities support activities', 'admin@gmail.com', '2025-01-20 00:00:00'),
(491, 9, 62, '81.21 General cleaning of buildings', 'admin@gmail.com', '2025-01-21 00:00:00'),
(492, 9, 62, '81.22 Other building and industrial cleaning activities', 'admin@gmail.com', '2025-01-22 00:00:00'),
(493, 9, 62, '81.29 Other cleaning activities', 'admin@gmail.com', '2025-01-23 00:00:00'),
(494, 9, 62, '81.3 Landscape service activities', 'admin@gmail.com', '2025-01-24 00:00:00'),
(495, 9, 62, '82.11 Combined office administrative service activities', 'admin@gmail.com', '2025-01-25 00:00:00'),
(496, 9, 62, '82.19 Photocopying, document preparation and other specialised office support activities', 'admin@gmail.com', '2025-01-26 00:00:00'),
(497, 9, 62, '82.2 Activities of call centres', 'admin@gmail.com', '2025-01-27 00:00:00'),
(498, 9, 62, '82.91 Activities of collection agencies and credit bureaus', 'admin@gmail.com', '2025-01-28 00:00:00'),
(499, 9, 62, '82.92 Packaging activities', 'admin@gmail.com', '2025-01-29 00:00:00'),
(500, 9, 62, '82.99 Other business support service activities n.e.c.', 'admin@gmail.com', '2025-01-30 00:00:00'),
(501, 9, 62, '84.11 General public administration activities', 'admin@gmail.com', '2025-01-31 00:00:00'),
(502, 9, 62, '84.12 Regulation of the activities of providing health care, education, cultural services and other ', 'admin@gmail.com', '2025-02-01 00:00:00'),
(503, 9, 62, '84.13 Regulation of and contribution to more efficient operation of businesses', 'admin@gmail.com', '2025-02-02 00:00:00'),
(504, 9, 62, '84.21 Foreign affairs', 'admin@gmail.com', '2025-02-03 00:00:00'),
(505, 9, 62, '84.23 Justice and judicial activities', 'admin@gmail.com', '2025-02-04 00:00:00'),
(506, 9, 62, '84.24 Public order and safety activities', 'admin@gmail.com', '2025-02-05 00:00:00'),
(507, 9, 62, '84.25 Fire service activities', 'admin@gmail.com', '2025-02-06 00:00:00'),
(508, 9, 62, '84.3 Compulsory social security activities', 'admin@gmail.com', '2025-02-07 00:00:00'),
(509, 9, 62, '87.9 Other residential care activities', 'admin@gmail.com', '2025-02-08 00:00:00'),
(510, 9, 62, '88.91 Child day-care activities', 'admin@gmail.com', '2025-02-09 00:00:00'),
(511, 9, 62, '88.99 Other social work activities without accommodation n.e.c.', 'admin@gmail.com', '2025-02-10 00:00:00'),
(512, 9, 62, '94.11 Activities of business and employers membership organisations', 'admin@gmail.com', '2025-02-11 00:00:00'),
(513, 9, 62, '94.12 Activities of professional membership organisations', 'admin@gmail.com', '2025-02-12 00:00:00'),
(514, 9, 62, '94.2 Activities of trade unions', 'admin@gmail.com', '2025-02-13 00:00:00'),
(515, 9, 62, '94.91 Activities of religious organisations', 'admin@gmail.com', '2025-02-14 00:00:00'),
(516, 9, 62, '94.92 Activities of political organisations', 'admin@gmail.com', '2025-02-15 00:00:00'),
(517, 9, 62, '94.99 Activities of other membership organisations n.e.c.', 'admin@gmail.com', '2025-02-16 00:00:00'),
(518, 9, 62, '95.11 Repair of computers and peripheral equipment', 'admin@gmail.com', '2025-02-17 00:00:00'),
(519, 9, 62, '95.12 Repair of communication equipment', 'admin@gmail.com', '2025-02-18 00:00:00'),
(520, 9, 62, '95.23 Repair of footwear and leather goods', 'admin@gmail.com', '2025-02-19 00:00:00'),
(521, 9, 62, '95.25 Repair of watches, clocks and jewellery', 'admin@gmail.com', '2025-02-20 00:00:00'),
(522, 9, 62, '96.01 Washing and (dry-)cleaning of textile and fur products', 'admin@gmail.com', '2025-02-21 00:00:00'),
(523, 9, 62, '96.02 Hairdressing and other beauty treatment', 'admin@gmail.com', '2025-02-22 00:00:00'),
(524, 9, 62, '96.03 Funeral and related activities', 'admin@gmail.com', '2025-02-23 00:00:00'),
(525, 9, 62, '96.04 Physical well-being activities', 'admin@gmail.com', '2025-02-24 00:00:00'),
(526, 9, 62, '96.09 Other personal service activities n.e.c.', 'admin@gmail.com', '2025-02-25 00:00:00'),
(527, 9, 62, '97 Activities of households as employers of domestic personnel', 'admin@gmail.com', '2025-02-26 00:00:00'),
(528, 9, 62, '98.1 Undifferentiated goods-producing activities of private households for own use', 'admin@gmail.com', '2025-02-27 00:00:00'),
(529, 9, 62, '98.2 Undifferentiated service-producing activities of private households for own use', 'admin@gmail.com', '2025-02-28 00:00:00'),
(530, 9, 62, '99 Activities of extraterritorial organisations and bodies', 'admin@gmail.com', '2025-03-01 00:00:00'),
(531, 10, 63, '26.12 Manufacture of loaded electronic boards', 'admin@gmail.com', '2025-03-02 00:00:00'),
(532, 10, 63, '46.51 Wholesale of computers, computer peripheral equipment and software', 'admin@gmail.com', '2025-03-03 00:00:00'),
(533, 10, 63, '46.52 Wholesale of electronic and telecommunications equipment and parts', 'admin@gmail.com', '2025-03-04 00:00:00'),
(534, 10, 64, '26.2 Manufacture of computers and peripheral equipment', 'admin@gmail.com', '2025-03-05 00:00:00'),
(535, 10, 64, '26.8 Manufacture of magnetic and optical media', 'admin@gmail.com', '2025-03-06 00:00:00'),
(536, 10, 65, '63.12 Web portals', 'admin@gmail.com', '2025-03-07 00:00:00'),
(537, 10, 66, '26.11 Manufacture of electronic components', 'admin@gmail.com', '2025-03-08 00:00:00'),
(538, 10, 66, '28.99 Manufacture of other special-purpose machinery n.e.c.', 'admin@gmail.com', '2025-03-09 00:00:00'),
(539, 10, 67, '58.29 Other software publishing', 'admin@gmail.com', '2025-03-10 00:00:00'),
(540, 10, 67, '62.01 Computer programming activities', 'admin@gmail.com', '2025-03-11 00:00:00'),
(541, 10, 67, '62.02 Computer consultancy activities', 'admin@gmail.com', '2025-03-12 00:00:00'),
(542, 10, 67, '62.03 Computer facilities management activities', 'admin@gmail.com', '2025-03-13 00:00:00'),
(543, 10, 67, '62.09 Other information technology and computer service activities', 'admin@gmail.com', '2025-03-14 00:00:00'),
(544, 10, 67, '63.11 Data processing, hosting and related activities', 'admin@gmail.com', '2025-03-15 00:00:00'),
(545, 10, 68, '61.1 Wired telecommunications activities', 'admin@gmail.com', '2025-03-16 00:00:00'),
(546, 10, 68, '61.2 Wireless telecommunications activities', 'admin@gmail.com', '2025-03-17 00:00:00'),
(547, 10, 68, '61.3 Satellite telecommunications activities', 'admin@gmail.com', '2025-03-18 00:00:00'),
(548, 10, 68, '61.9 Other telecommunications activities', 'admin@gmail.com', '2025-03-19 00:00:00'),
(549, 11, 69, '51.21 Freight air transport', 'admin@gmail.com', '2025-03-20 00:00:00'),
(550, 11, 69, '52.24 Cargo handling', 'admin@gmail.com', '2025-03-21 00:00:00'),
(551, 11, 69, '52.29 Other transportation support activities', 'admin@gmail.com', '2025-03-22 00:00:00'),
(552, 11, 69, '53.1 Postal activities under universal service obligation', 'admin@gmail.com', '2025-03-23 00:00:00'),
(553, 11, 69, '53.2 Other postal and courier activities', 'admin@gmail.com', '2025-03-24 00:00:00'),
(554, 11, 70, '51.1 Passenger air transport', 'admin@gmail.com', '2025-03-25 00:00:00'),
(555, 11, 71, '22.11 Manufacture of rubber tyres and tubes; retreading and rebuilding of rubber tyres', '', '0000-00-00 00:00:00'),
(556, 11, 71, '29.31 Manufacture of electrical and electronic equipment for motor vehicles', '', '0000-00-00 00:00:00'),
(557, 11, 71, '29.32 Manufacture of other parts and accessories for motor vehicles', '', '0000-00-00 00:00:00'),
(558, 11, 72, '29.1 Manufacture of motor vehicles', '', '0000-00-00 00:00:00'),
(559, 11, 72, '30.91 Manufacture of motorcycles', '', '0000-00-00 00:00:00'),
(560, 11, 73, '49.31 Urban and suburban passenger land transport', '', '0000-00-00 00:00:00'),
(561, 11, 73, '49.32 Taxi operation', '', '0000-00-00 00:00:00'),
(562, 11, 73, '49.39 Other passenger land transport n.e.c.', '', '0000-00-00 00:00:00'),
(563, 11, 73, '77.11 Rental and leasing of cars and light motor vehicles', '', '0000-00-00 00:00:00'),
(564, 11, 74, '55.1 Hotels and similar accommodation', '', '0000-00-00 00:00:00'),
(565, 11, 74, '55.2 Holiday and other short-stay accommodation', '', '0000-00-00 00:00:00'),
(566, 11, 74, '55.9 Other accommodation', '', '0000-00-00 00:00:00'),
(567, 11, 74, '79.11 Travel agency activities', '', '0000-00-00 00:00:00'),
(568, 11, 74, '79.12 Tour operator activities', '', '0000-00-00 00:00:00'),
(569, 11, 74, '79.9 Other reservation service and related activities', '', '0000-00-00 00:00:00'),
(570, 11, 75, '50.1 Sea and coastal passenger water transport', '', '0000-00-00 00:00:00'),
(571, 11, 75, '50.2 Sea and coastal freight water transport', '', '0000-00-00 00:00:00'),
(572, 11, 75, '50.3 Inland passenger water transport', '', '0000-00-00 00:00:00'),
(573, 11, 75, '50.4 Inland freight water transport', '', '0000-00-00 00:00:00'),
(574, 11, 75, '77.34 Rental and leasing of water transport equipment', '', '0000-00-00 00:00:00'),
(575, 11, 76, '49.1 Passenger rail transport, interurban', '', '0000-00-00 00:00:00'),
(576, 11, 76, '49.2 Freight rail transport', '', '0000-00-00 00:00:00'),
(577, 11, 77, '49.41 Freight transport by road', '', '0000-00-00 00:00:00'),
(578, 11, 77, '49.42 Removal services', '', '0000-00-00 00:00:00'),
(579, 11, 77, '77.12 Rental and leasing of trucks', '', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `md_industries`
--

CREATE TABLE `md_industries` (
  `id` int(11) NOT NULL,
  `sec_id` int(11) NOT NULL,
  `ind_name` varchar(100) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_industries`
--

INSERT INTO `md_industries` (`id`, `sec_id`, `ind_name`, `created_by`, `created_dt`) VALUES
(1, 1, 'Apparel, Accessories & Footwear', 'admin', '2023-08-24 00:00:00'),
(2, 1, 'Appliance Manufacturing', 'admin', '2023-08-25 00:00:00'),
(3, 1, 'Building Products & Furnishings', 'admin', '2023-08-26 00:00:00'),
(4, 1, 'E-commerce', 'admin', '2023-08-27 00:00:00'),
(5, 1, 'Household & Personal Products', 'admin', '2023-08-28 00:00:00'),
(6, 1, 'Multiline and Specialty Retailers & Distributors', 'admin', '2023-08-29 00:00:00'),
(7, 1, 'Toys & Sporting Goods', 'admin', '2023-08-30 00:00:00'),
(8, 2, 'Coal Operations', 'admin', '2023-08-31 00:00:00'),
(9, 2, 'Construction Materials', 'admin', '2023-09-01 00:00:00'),
(10, 2, 'Iron & Steel Producers', 'admin', '2023-09-02 00:00:00'),
(11, 2, 'Metals & Mining', 'admin', '2023-09-03 00:00:00'),
(12, 2, 'Oil & Gas - Exploration & Production', 'admin', '2023-09-04 00:00:00'),
(13, 2, 'Oil & Gas - Midstream', 'admin', '2023-09-05 00:00:00'),
(14, 2, 'Oil & Gas - Refining & Marketing', 'admin', '2023-09-06 00:00:00'),
(15, 2, 'Oil & Gas - Services', 'admin', '2023-09-07 00:00:00'),
(16, 3, 'Asset Management & Custody Activities', 'admin', '2023-09-08 00:00:00'),
(17, 3, 'Commercial Banks', 'admin', '2023-09-09 00:00:00'),
(18, 3, 'Consumer Finance', 'admin', '2023-09-10 00:00:00'),
(19, 3, 'Insurance', 'admin', '2023-09-11 00:00:00'),
(20, 3, 'Investment Banking & Brokerage', 'admin', '2023-09-12 00:00:00'),
(21, 3, 'Mortgage Finance', 'admin', '2023-09-13 00:00:00'),
(22, 3, 'Security & Commodity Exchanges', 'admin', '2023-09-14 00:00:00'),
(23, 4, 'Agricultural Products', 'admin', '2023-09-15 00:00:00'),
(24, 4, 'Alcoholic Beverages', 'admin', '2023-09-16 00:00:00'),
(25, 4, 'Food Retailers & Distributors', 'admin', '2023-09-17 00:00:00'),
(26, 4, 'Meat, Poultry & Dairy', 'admin', '2023-09-18 00:00:00'),
(27, 4, 'Non-Alcoholic Beverages', 'admin', '2023-09-19 00:00:00'),
(28, 4, 'Processed Foods', 'admin', '2023-09-20 00:00:00'),
(29, 4, 'Restaurants', 'admin', '2023-09-21 00:00:00'),
(30, 4, 'Tobacco', 'admin', '2023-09-22 00:00:00'),
(31, 5, 'Biotechnology & Pharmaceuticals', 'admin', '2023-09-23 00:00:00'),
(32, 5, 'Drug Retailers', 'admin', '2023-09-24 00:00:00'),
(33, 5, 'Health Care Delivery', 'admin', '2023-09-25 00:00:00'),
(34, 5, 'Health Care Distributors', 'admin', '2023-09-26 00:00:00'),
(35, 5, 'Managed Care', 'admin', '2023-09-27 00:00:00'),
(36, 5, 'Medical Equipment & Supplies', 'admin', '2023-09-28 00:00:00'),
(37, 6, 'Electric Utilities & Power Generators', 'admin', '2023-09-29 00:00:00'),
(38, 6, 'Engineering & Construction Services', 'admin', '2023-09-30 00:00:00'),
(39, 6, 'Gas Utilities & Distributors', 'admin', '2023-10-01 00:00:00'),
(40, 6, 'Home Builders', 'admin', '2023-10-02 00:00:00'),
(41, 6, 'Real Estate', 'admin', '2023-10-03 00:00:00'),
(42, 6, 'Real Estate Services', 'admin', '2023-10-04 00:00:00'),
(43, 6, 'Waste Management', 'admin', '2023-10-05 00:00:00'),
(44, 6, 'Water Utilities & Services', 'admin', '2023-10-06 00:00:00'),
(45, 7, 'Biofuels', 'admin', '2023-10-07 00:00:00'),
(46, 7, 'Forestry Management', 'admin', '2023-10-08 00:00:00'),
(47, 7, 'Fuel Cells & Industrial Batteries', 'admin', '2023-10-09 00:00:00'),
(48, 7, 'Pulp & Paper Products', 'admin', '2023-10-10 00:00:00'),
(49, 7, 'Solar Technology & Project Developers', 'admin', '2023-10-11 00:00:00'),
(50, 7, 'Wind Technology & Project Developers', 'admin', '2023-10-12 00:00:00'),
(51, 8, 'Aerospace & Defense', 'admin', '2023-10-13 00:00:00'),
(52, 8, 'Chemicals', 'admin', '2023-10-14 00:00:00'),
(53, 8, 'Containers & Packaging', 'admin', '2023-10-15 00:00:00'),
(54, 8, 'Electrical & Electronic Equipment', 'admin', '2023-10-16 00:00:00'),
(55, 8, 'Industrial Machinery & Goods', 'admin', '2023-10-17 00:00:00'),
(56, 9, 'Advertising & Marketing', 'admin', '2023-10-18 00:00:00'),
(57, 9, 'Casinos & Gaming', 'admin', '2023-10-19 00:00:00'),
(58, 9, 'Education', 'admin', '2023-10-20 00:00:00'),
(59, 9, 'Hotels & Lodging', 'admin', '2023-10-21 00:00:00'),
(60, 9, 'Leisure Facilities', 'admin', '2023-10-22 00:00:00'),
(61, 10, 'Media & Entertainment', 'admin', '2023-10-23 00:00:00'),
(62, 10, 'Professional & Commercial Services', 'admin', '2023-10-24 00:00:00'),
(63, 10, 'Electronic Manufacturing Services & Original Design Manufacturing', 'admin', '2023-10-25 00:00:00'),
(64, 10, 'Hardware', 'admin', '2023-10-26 00:00:00'),
(65, 10, 'Internet Media & Services', 'admin', '2023-10-27 00:00:00'),
(66, 10, 'Semiconductors', 'admin', '2023-10-28 00:00:00'),
(67, 11, 'Software & IT Services', 'admin', '2023-10-29 00:00:00'),
(68, 11, 'Telecommunication Services', 'admin', '2023-10-30 00:00:00'),
(69, 11, 'Air Freight & Logistics', 'admin', '2023-10-31 00:00:00'),
(70, 11, 'Airlines', 'admin', '2023-11-01 00:00:00'),
(71, 11, 'Auto Parts', 'admin', '2023-11-02 00:00:00'),
(72, 11, 'Automobiles', 'admin', '2023-11-03 00:00:00'),
(73, 11, 'Car Rental & Leasing', 'admin', '2023-11-04 00:00:00'),
(74, 11, 'Cruise Lines', 'admin', '2023-11-05 00:00:00'),
(75, 11, 'Marine Transportation', 'admin', '2023-11-06 00:00:00'),
(76, 11, 'Rail Transportation', 'admin', '2023-11-07 00:00:00'),
(77, 11, 'Road Transportation', 'admin', '2023-11-08 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `md_industries_topics`
--

CREATE TABLE `md_industries_topics` (
  `id` int(11) NOT NULL,
  `ind_id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `topic_flag` enum('Y','N') NOT NULL DEFAULT 'Y',
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_industries_topics`
--

INSERT INTO `md_industries_topics` (`id`, `ind_id`, `topic_id`, `topic_flag`, `created_by`, `created_dt`, `modified_by`, `modified_dt`) VALUES
(1, 1, 11, 'Y', 'admin', '2023-08-28 14:49:12', NULL, NULL),
(2, 1, 19, 'Y', 'admin', '2023-08-28 14:49:12', NULL, NULL),
(3, 1, 20, 'Y', 'admin', '2023-08-28 14:49:12', NULL, NULL),
(4, 2, 11, 'Y', 'admin', '2023-08-28 14:52:17', NULL, NULL),
(5, 2, 17, 'Y', 'admin', '2023-08-28 14:52:17', NULL, NULL),
(6, 3, 3, 'Y', 'admin', '2023-08-28 14:55:57', NULL, NULL),
(7, 3, 11, 'Y', 'admin', '2023-08-28 14:55:57', NULL, NULL),
(8, 3, 17, 'Y', 'admin', '2023-08-28 14:55:57', NULL, NULL),
(9, 3, 19, 'Y', 'admin', '2023-08-28 14:55:57', NULL, NULL),
(10, 58, 9, 'Y', 'admin', '2023-09-01 11:30:30', NULL, NULL),
(11, 58, 12, 'Y', 'admin', '2023-09-01 11:30:30', NULL, NULL),
(12, 58, 13, 'Y', 'admin', '2023-09-01 11:30:30', NULL, NULL),
(13, 1, 21, 'Y', 'admin', '2023-09-01 11:33:10', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `md_location`
--

CREATE TABLE `md_location` (
  `id` int(11) NOT NULL,
  `location_name` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_location`
--

INSERT INTO `md_location` (`id`, `location_name`, `created_by`, `created_dt`) VALUES
(1, 'United States', NULL, NULL),
(2, 'Germany', NULL, NULL),
(3, 'Latin America', NULL, NULL),
(4, 'South Korea', NULL, NULL),
(5, 'United Kingdom', NULL, NULL),
(6, 'MiddlEast', NULL, NULL),
(7, 'France', NULL, NULL),
(8, 'Canada', NULL, NULL),
(9, 'Italy', NULL, NULL),
(10, 'Germany', NULL, NULL),
(11, 'Asean', NULL, NULL),
(12, 'South Africa', NULL, NULL),
(13, 'Australia', NULL, NULL),
(14, 'India', NULL, NULL),
(15, 'Scandinavia', NULL, NULL),
(16, 'Brazil', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `md_sector`
--

CREATE TABLE `md_sector` (
  `id` int(11) NOT NULL,
  `sec_name` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_sector`
--

INSERT INTO `md_sector` (`id`, `sec_name`, `created_by`, `created_dt`) VALUES
(1, 'Consumer Goods', 'admin@gmail.com', '2023-08-24 00:00:00'),
(2, 'Extractives & Minerals Processing', 'admin@gmail.com', '2023-08-25 00:00:00'),
(3, 'Financial', 'admin@gmail.com', '2023-08-26 00:00:00'),
(4, 'Food & Beverage', 'admin@gmail.com', '2023-08-27 00:00:00'),
(5, 'Health Care', 'admin@gmail.com', '2023-08-28 00:00:00'),
(6, 'Infrastructure', 'admin@gmail.com', '2023-08-29 00:00:00'),
(7, 'Renewable Resources & Alternative Energy', 'admin@gmail.com', '2023-08-30 00:00:00'),
(8, 'Resource Transformation', 'admin@gmail.com', '2023-08-31 00:00:00'),
(9, 'Services', 'admin@gmail.com', '2023-09-01 00:00:00'),
(10, 'Technology & Communications', 'admin@gmail.com', '2023-09-02 00:00:00'),
(11, 'Transportation', 'admin@gmail.com', '2023-09-03 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `md_topic`
--

CREATE TABLE `md_topic` (
  `id` int(11) NOT NULL,
  `topic_catg_id` int(11) NOT NULL,
  `topic_name` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_topic`
--

INSERT INTO `md_topic` (`id`, `topic_catg_id`, `topic_name`, `created_by`, `created_dt`) VALUES
(1, 1, 'GHG Emissions', 'admin', '2023-09-02 00:00:00'),
(2, 1, 'Air Quality', 'admin', '2023-09-03 00:00:00'),
(3, 1, 'Energy Management', 'admin', '2023-09-04 00:00:00'),
(4, 1, 'Water & Wastewater Management', 'admin', '2023-09-05 00:00:00'),
(5, 1, 'Waste & Hazardous Materials Management', 'admin', '2023-09-06 00:00:00'),
(6, 1, 'Ecological Impacts', 'admin', '2023-09-07 00:00:00'),
(7, 2, 'Human Rights & Community Relations', 'admin', '2023-09-08 00:00:00'),
(8, 2, 'Customer Privacy', 'admin', '2023-09-09 00:00:00'),
(9, 2, 'Data Security', 'admin', '2023-09-10 00:00:00'),
(10, 2, 'Access & Affordability', 'admin', '2023-09-11 00:00:00'),
(11, 2, 'Product Quality & Safety', 'admin', '2023-09-12 00:00:00'),
(12, 2, 'Customer Welfare', 'admin', '2023-09-13 00:00:00'),
(13, 2, 'Selling Practices & Product Labeling', 'admin', '2023-09-14 00:00:00'),
(14, 3, 'Labor Practices', 'admin', '2023-09-15 00:00:00'),
(15, 3, 'Employee Health & Safety', 'admin', '2023-09-16 00:00:00'),
(16, 3, 'Employee Engagement, Diversity & Inclusion', 'admin', '2023-09-17 00:00:00'),
(17, 4, 'Product Design & Lifecycle Management', 'admin', '2023-09-18 00:00:00'),
(18, 4, 'Business Model Resilience', 'admin', '2023-09-19 00:00:00'),
(19, 4, 'Supply Chain Management', 'admin', '2023-09-20 00:00:00'),
(20, 4, 'Materials Sourcing & Efficiency', 'admin', '2023-09-21 00:00:00'),
(21, 4, 'Physical Impacts of Climate Change', 'admin', '2023-09-22 00:00:00'),
(22, 5, 'Business Ethics', 'admin', '2023-09-23 00:00:00'),
(23, 5, 'Competitive Behavior', 'admin', '2023-09-24 00:00:00'),
(24, 5, 'Management of the Legal & Regulatory Environment', 'admin', '2023-09-25 00:00:00'),
(25, 5, 'Critical Incident Risk Management', 'admin', '2023-09-26 00:00:00'),
(26, 5, 'Systemic Risk Management', 'admin', '2023-09-27 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `md_topic_catg`
--

CREATE TABLE `md_topic_catg` (
  `id` int(11) NOT NULL,
  `catg_name` varchar(50) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_topic_catg`
--

INSERT INTO `md_topic_catg` (`id`, `catg_name`, `created_by`, `created_dt`) VALUES
(1, 'Environment', 'admin', '2023-09-02 00:00:00'),
(2, 'Social Capital', 'admin', '2023-09-03 00:00:00'),
(3, 'Human Capital', 'admin', '2023-09-04 00:00:00'),
(4, 'Business Model & Innovation', 'admin', '2023-09-05 00:00:00'),
(5, 'Leadership & Governance', 'admin', '2023-09-06 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `md_user`
--

CREATE TABLE `md_user` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL DEFAULT 0,
  `user_name` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `user_type` enum('S','A','C','E','V') DEFAULT NULL COMMENT 'S-> Super Admin; C-> Client; A-> Admin User; E-> Editor; V-> Viewer',
  `active_flag` enum('Y','N') NOT NULL DEFAULT 'Y',
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `md_user`
--

INSERT INTO `md_user` (`id`, `client_id`, `user_name`, `user_id`, `password`, `user_type`, `active_flag`, `created_by`, `created_dt`, `modified_by`, `modified_dt`, `last_login`) VALUES
(1, 0, 'Admin', 'admin@gmail.com', '$2b$10$IBqFiOnGUiHZpBnXGnMBwu6CB2IbcUBHLvpC2jdRsSx7QIXaATTei', 'S', 'Y', 'admin', '2023-08-18 15:44:12', NULL, NULL, NULL),
(3, 1, 'Subham', 'user@gmail.com', '$2b$10$IBqFiOnGUiHZpBnXGnMBwu6CB2IbcUBHLvpC2jdRsSx7QIXaATTei', 'C', 'Y', 'admin', '2023-08-18 15:44:12', NULL, NULL, NULL),
(4, 1, 'Amit Mondal', 'amit@gmail.com', '$2b$10$QtZombI6sDTRuW/mclT3g.uhUo6VMFCSFCwq/ke6.r5RwY6xq2U76', 'E', 'Y', 'Subham', '2023-09-15 12:21:26', NULL, NULL, NULL),
(5, 1, 'Subham Samanta', 'subham@gmail.com', '$2b$10$3hqs9TpGpYQUA1Rz0h9wh.p/V48gT8arS/WrupYt0oITqHnrI1iFS', 'E', 'Y', 'Subham', '2023-09-15 15:56:49', NULL, NULL, NULL),
(6, 1, 'Tanmoy Mondal', 'tanmoy@gmail.com', '$2b$10$DN1DdRHAKs/nJRDb8jtbEeGm2ad4QGZxGcePG7RSM9LZj4sbN.H32', 'A', 'Y', 'Subham', '2023-09-15 15:57:21', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `td_act_metrics`
--

CREATE TABLE `td_act_metrics` (
  `id` int(11) NOT NULL,
  `sec_id` int(11) NOT NULL,
  `ind_id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `act_metric` text DEFAULT NULL,
  `catg` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `created_by` varchar(50) NOT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `td_act_metrics`
--

INSERT INTO `td_act_metrics` (`id`, `sec_id`, `ind_id`, `sl_no`, `act_metric`, `catg`, `unit`, `code`, `created_by`, `created_dt`, `modified_by`, `modified_dt`) VALUES
(1, 9, 58, 1, 'Number of students enrolled4', 'Quantitative', 'Number', 'SV-ED-000.A', 'admin', '2023-09-04 16:40:51', 'admin', '2023-09-04 16:46:21'),
(2, 9, 58, 2, 'Number of applications received for enrollment', 'Quantitative', 'Number', 'SV-ED-000.B', 'admin', '2023-09-04 16:40:51', 'admin', '2023-09-04 16:46:21'),
(3, 9, 58, 3, 'Average registered credits per student, percentage online', 'Quantitative', 'Number, Percentage (%)', 'SV-ED-000.C', 'admin', '2023-09-04 16:40:51', 'admin', '2023-09-04 16:46:21');

-- --------------------------------------------------------

--
-- Table structure for table `td_client`
--

CREATE TABLE `td_client` (
  `id` int(11) NOT NULL,
  `entry_dt` datetime DEFAULT NULL,
  `client_name` varchar(50) NOT NULL,
  `plan_type` enum('B','S','P') DEFAULT NULL COMMENT 'B-> Basic; S-> Standard; P-> Premium',
  `pay_flag` enum('Y','N') DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `td_client`
--

INSERT INTO `td_client` (`id`, `entry_dt`, `client_name`, `plan_type`, `pay_flag`, `created_by`, `created_dt`, `modified_by`, `modified_dt`) VALUES
(1, '2023-09-14 14:20:00', 'Synergic Softek Solutions', 'B', 'Y', 'admin', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `td_data_collection`
--

CREATE TABLE `td_data_collection` (
  `id` int(11) NOT NULL,
  `dt_year` int(11) NOT NULL,
  `sec_id` int(11) NOT NULL,
  `ind_id` int(11) NOT NULL,
  `top_id` int(11) NOT NULL,
  `data_file_name` varchar(100) DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `td_data_collection`
--

INSERT INTO `td_data_collection` (`id`, `dt_year`, `sec_id`, `ind_id`, `top_id`, `data_file_name`, `created_by`, `created_dt`, `modified_by`, `modified_dt`) VALUES
(1, 2023, 9, 58, 10, '9_58_10_2023.json', 'admin', '2023-09-08 14:07:52', NULL, NULL),
(2, 2023, 9, 58, 11, '9_58_11_2023.json', 'admin', '2023-09-14 11:44:49', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `td_project`
--

CREATE TABLE `td_project` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `project_name` varchar(100) NOT NULL,
  `last_access` datetime DEFAULT NULL,
  `last_accessed_by` varchar(50) DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `td_project`
--

INSERT INTO `td_project` (`id`, `client_id`, `project_name`, `last_access`, `last_accessed_by`, `created_by`, `created_dt`, `modified_by`, `modified_dt`) VALUES
(1, 1, 'Test Project', NULL, NULL, 'Subham', '2023-09-15 15:57:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `td_sus_dis_top_met`
--

CREATE TABLE `td_sus_dis_top_met` (
  `id` int(11) NOT NULL,
  `sec_id` int(11) NOT NULL,
  `ind_id` int(11) NOT NULL,
  `top_id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `metric` text DEFAULT NULL,
  `catg` text DEFAULT NULL,
  `unit` varchar(100) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `td_sus_dis_top_met`
--

INSERT INTO `td_sus_dis_top_met` (`id`, `sec_id`, `ind_id`, `top_id`, `sl_no`, `metric`, `catg`, `unit`, `code`, `created_by`, `created_dt`, `modified_by`, `modified_dt`) VALUES
(1, 9, 58, 10, 1, 'Description of approach to identifying and addressing data security risks', 'Discussion and Analysis', 'n/a', 'SV-ED-230a.1', 'admin', '2023-09-08 16:44:11', NULL, NULL),
(2, 9, 58, 10, 2, 'Description of policies and practices relating to collection, usage, and retention of student information', 'Discussion and Analysis', 'n/a', 'SV-ED-230a.2', 'admin', '2023-09-08 16:44:11', NULL, NULL),
(3, 9, 58, 11, 1, 'Graduation rate', 'Quantitative', 'Percentage (%)', 'SV-ED-260a.1', 'admin', '2023-09-08 16:44:11', NULL, NULL),
(4, 9, 58, 11, 2, 'On-time completion rate', 'Quantitative', 'Percentage (%)', 'SV-ED-260a.2', 'admin', '2023-09-08 16:44:11', NULL, NULL),
(5, 9, 58, 12, 1, 'Description of policies to assure disclosure of key performance statistics to prospective students in advance of collecting any fees and discussion of outcomes', 'Discussion and Analysis', 'n/a', 'SV-ED-270a.1', 'admin', '2023-09-08 16:44:11', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `td_user_project`
--

CREATE TABLE `td_user_project` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_by` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT NULL,
  `modified_by` varchar(50) DEFAULT NULL,
  `modified_dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `td_user_project`
--

INSERT INTO `td_user_project` (`id`, `client_id`, `project_id`, `user_id`, `created_by`, `created_dt`, `modified_by`, `modified_dt`) VALUES
(1, 1, 1, 4, 'Subham', '2023-09-15 15:57:54', NULL, NULL),
(2, 1, 1, 6, 'Subham', '2023-09-15 15:57:54', NULL, NULL),
(3, 1, 1, 5, 'Subham', '2023-09-15 15:57:54', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `md_busi_act`
--
ALTER TABLE `md_busi_act`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `md_industries`
--
ALTER TABLE `md_industries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `md_industries_topics`
--
ALTER TABLE `md_industries_topics`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `md_location`
--
ALTER TABLE `md_location`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `md_sector`
--
ALTER TABLE `md_sector`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `md_topic`
--
ALTER TABLE `md_topic`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `md_topic_catg`
--
ALTER TABLE `md_topic_catg`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `md_user`
--
ALTER TABLE `md_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `td_act_metrics`
--
ALTER TABLE `td_act_metrics`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `td_client`
--
ALTER TABLE `td_client`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `td_data_collection`
--
ALTER TABLE `td_data_collection`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `td_project`
--
ALTER TABLE `td_project`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `td_sus_dis_top_met`
--
ALTER TABLE `td_sus_dis_top_met`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `td_user_project`
--
ALTER TABLE `td_user_project`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `md_busi_act`
--
ALTER TABLE `md_busi_act`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=580;

--
-- AUTO_INCREMENT for table `md_industries`
--
ALTER TABLE `md_industries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `md_industries_topics`
--
ALTER TABLE `md_industries_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `md_location`
--
ALTER TABLE `md_location`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `md_sector`
--
ALTER TABLE `md_sector`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `md_topic`
--
ALTER TABLE `md_topic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `md_topic_catg`
--
ALTER TABLE `md_topic_catg`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `md_user`
--
ALTER TABLE `md_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `td_act_metrics`
--
ALTER TABLE `td_act_metrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `td_client`
--
ALTER TABLE `td_client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `td_data_collection`
--
ALTER TABLE `td_data_collection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `td_project`
--
ALTER TABLE `td_project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `td_sus_dis_top_met`
--
ALTER TABLE `td_sus_dis_top_met`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `td_user_project`
--
ALTER TABLE `td_user_project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
