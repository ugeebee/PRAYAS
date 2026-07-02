/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: prayas_db
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `posting_id` int(11) NOT NULL,
  `current_status` varchar(50) DEFAULT 'APPLIED',
  `medical_certificate_path` varchar(255) DEFAULT NULL,
  `timeline_log` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`timeline_log`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `form_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`form_data`)),
  `completion_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`completion_data`)),
  PRIMARY KEY (`id`),
  KEY `posting_id` (`posting_id`),
  KEY `idx_app_emp` (`employee_id`),
  KEY `idx_app_status` (`current_status`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees_local` (`employee_id`),
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`posting_id`) REFERENCES `volunteer_postings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES
(1,'NHPC1001',1,'FORWARDED_TO_HR',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:25:04.462Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:32:39.965Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"Anjali Gupta\",\"ro_designation\":\"testRO\"},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:32:39.965Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:32:39.965Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:32:39.965Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:33:16.476Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:33:16.476Z\",\"note\":\"Application process complete.\"},{\"step\":8,\"title\":\"Terminated by Volunteer\",\"status\":\"TERMINATED\",\"date\":\"2026-06-28T17:06:35.019Z\",\"note\":\"Reason: work done\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:07:08.181Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:10:52.413Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"},{\"step\":10,\"title\":\"Form-D Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:25:56.112Z\",\"note\":\"NGO has submitted partner organization feedback.\"}]','2026-06-28 15:25:04','2026-06-28 17:25:56','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"testEMP\",\"department\":\"IT\",\"contact\":\"test\",\"email\":\"test@test\",\"fromDate\":\"2026-06-28\",\"toDate\":\"2026-07-01\"}','{\"formC\":{\"sectionA\":{\"overview\":\"test\",\"contributions\":\"test\",\"learnings\":\"test\",\"challenges\":\"test\",\"suggestions\":\"test\",\"comments\":\"test\",\"submittedAt\":\"2026-06-28T17:07:08.181Z\",\"signature\":\"Rahul Sharma\"},\"sectionB\":{\"comments\":\"\",\"managerDesignation\":\"testRO\",\"submittedAt\":\"2026-06-28T17:10:52.413Z\",\"signature\":\"Anjali Gupta\"}},\"formD\":{\"taskDetails\":\"testNGO\",\"quality\":\"testNGO\",\"impact\":\"testNGO\",\"suggestionsNHPC\":\"testNGO\",\"submittedAt\":\"2026-06-28T17:25:56.112Z\",\"signature\":\"HealthCare Plus\"}}'),
(2,'NHPC1001',2,'TERMINATED_BY_NGO','/uploads/medical_cert_1782675604466.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T15:46:33.135Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:40:27.198Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"Anjali Gupta\",\"ro_designation\":\"RO\"},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:40:27.198Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:40:27.198Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:40:27.198Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:53:29.483Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:53:29.483Z\",\"note\":\"Application process complete.\"},{\"step\":8,\"title\":\"Terminated by NGO\",\"status\":\"TERMINATED\",\"date\":\"2026-06-28T19:53:45.889Z\",\"note\":\"Reason: iver\\n\"}]','2026-06-28 15:46:33','2026-06-28 19:53:45','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"test\",\"department\":\"IT\",\"contact\":\"test\",\"email\":\"test@test\",\"fromDate\":\"2026-06-25\",\"toDate\":\"2026-06-28\"}','{\"formC\":{\"sectionA\":null,\"sectionB\":null},\"formD\":null}'),
(3,'NHPC1001',2,'FORWARDED_TO_HR','/uploads/medical_cert_1782668453748.PDF','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:39:27.251Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:41:23.237Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"Anjali Gupta\",\"ro_designation\":\"testRO\"},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:41:23.238Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:41:23.238Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:41:23.238Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:41:44.696Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:41:44.696Z\",\"note\":\"Application process complete.\"},{\"step\":8,\"title\":\"Terminated by NGO\",\"status\":\"TERMINATED\",\"date\":\"2026-06-28T17:42:35.996Z\",\"note\":\"Reason: work done\\n\"},{\"step\":10,\"title\":\"Form-D Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:42:55.192Z\",\"note\":\"NGO has submitted partner organization feedback.\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:43:17.072Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T17:43:37.601Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"}]','2026-06-28 17:39:27','2026-06-28 17:43:37','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"test\",\"department\":\"test\",\"contact\":\"test\",\"email\":\"test@test\",\"fromDate\":\"2026-06-28\",\"toDate\":\"2026-06-28\"}','{\"formD\":{\"taskDetails\":\"test\",\"quality\":\"test\",\"impact\":\"test\",\"suggestionsNHPC\":\"test\\n\",\"submittedAt\":\"2026-06-28T17:42:55.192Z\",\"signature\":\"HealthCare Plus\"},\"formC\":{\"sectionA\":{\"overview\":\"test\",\"contributions\":\"test\",\"learnings\":\"test\",\"challenges\":\"test\",\"suggestions\":\"test\",\"comments\":\"test\",\"submittedAt\":\"2026-06-28T17:43:17.072Z\",\"signature\":\"Rahul Sharma\"},\"sectionB\":{\"comments\":\"\",\"managerDesignation\":\"testRO\",\"submittedAt\":\"2026-06-28T17:43:37.601Z\",\"signature\":\"Anjali Gupta\"}}}'),
(4,'NHPC1001',2,'APPLIED',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T18:07:20.667Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"PENDING\",\"date\":null},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"PENDING\",\"date\":null},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"PENDING\",\"date\":null},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"PENDING\",\"date\":null},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-06-28 18:07:20','2026-06-28 18:07:20','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"test\",\"department\":\"test\",\"contact\":\"test\",\"email\":\"test@test\",\"fromDate\":\"2026-06-28\",\"toDate\":\"2026-06-30\"}',NULL),
(5,'NHPC1001',2,'Acknowledged and all set','/uploads/medical_cert_1782675371270.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:34:53.709Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:36:40.146Z\",\"note\":\"RO Review: APPROVED. Remarks: d\",\"ro_name\":\"Anjali Gupta\",\"ro_designation\":\"Reporting Officer\"},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:36:40.147Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:36:40.147Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:36:40.147Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:46:00.382Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:46:00.382Z\",\"note\":\"Application process complete.\"}]','2026-06-28 19:34:53','2026-06-28 19:46:00','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"test\",\"department\":\"test\",\"contact\":\"9999999999\",\"email\":\"test@test\"}','{\"formC\":{\"sectionA\":null,\"sectionB\":null},\"formD\":null}'),
(6,'NHPC1001',2,'APPLIED',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-28T19:39:23.998Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"PENDING\",\"date\":null},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"PENDING\",\"date\":null},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"PENDING\",\"date\":null},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"PENDING\",\"date\":null},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-06-28 19:39:23','2026-06-28 19:39:23','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"test\",\"department\":\"test\",\"contact\":\"9999999999\",\"email\":\"test@test\"}',NULL);
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approvals`
--

DROP TABLE IF EXISTS `approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `ro_employee_id` varchar(50) DEFAULT NULL,
  `ro_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `idx_approvals_ro_status` (`ro_employee_id`,`status`),
  KEY `idx_approvals_employee` (`employee_id`),
  CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
INSERT INTO `approvals` VALUES
(1,1,'NHPC1001','NHPC1002','Anjali Gupta','APPROVED','2026-06-28 15:25:04'),
(2,2,'NHPC1001','NHPC1002','Anjali Gupta','APPROVED','2026-06-28 15:46:33'),
(3,3,'NHPC1001','NHPC1002','Anjali Gupta','APPROVED','2026-06-28 17:39:27'),
(4,4,'NHPC1001','NHPC1002','Anjali Gupta','PENDING','2026-06-28 18:07:20'),
(5,5,'NHPC1001','NHPC1002','Anjali Gupta','APPROVED','2026-06-28 19:34:53'),
(6,6,'NHPC1001','NHPC1002','Anjali Gupta','PENDING','2026-06-28 19:39:24');
/*!40000 ALTER TABLE `approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dept`
--

DROP TABLE IF EXISTS `dept`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dept` (
  `id` varchar(50) NOT NULL,
  `dept_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dept`
--

LOCK TABLES `dept` WRITE;
/*!40000 ALTER TABLE `dept` DISABLE KEYS */;
INSERT INTO `dept` VALUES
('DEPT-CSR','CSR & SD Division','csr@nhpc.com','admin123'),
('DEPT-HR','HR/T&HRD Division','hr@nhpc.com','admin123');
/*!40000 ALTER TABLE `dept` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dept_local`
--

DROP TABLE IF EXISTS `dept_local`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dept_local` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dept_id` varchar(50) NOT NULL,
  `dept_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `dept_id` (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dept_local`
--

LOCK TABLES `dept_local` WRITE;
/*!40000 ALTER TABLE `dept_local` DISABLE KEYS */;
INSERT INTO `dept_local` VALUES
(1,'DEPT-CSR','CSR & SD Division','2026-06-28 15:22:33'),
(2,'DEPT-HR','HR/T&HRD Division','2026-06-28 17:11:23');
/*!40000 ALTER TABLE `dept_local` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_reporting_officer` tinyint(1) DEFAULT 0,
  `manager_id` int(11) DEFAULT NULL,
  `total_hours_logged` decimal(5,2) DEFAULT 0.00,
  `password_hash` varchar(255) DEFAULT 'pass123',
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES
(1,'NHPC1002','Anjali Gupta',1,NULL,0.00,'pass123'),
(2,'NHPC1001','Rahul Sharma',0,1,0.00,'pass123');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees_local`
--

DROP TABLE IF EXISTS `employees_local`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees_local` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_reporting_officer` tinyint(1) DEFAULT 0,
  `manager_id` int(11) DEFAULT NULL,
  `total_hours_logged` decimal(5,2) DEFAULT 0.00,
  `otp` varchar(10) DEFAULT NULL,
  `ttl` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `employees_local_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `employees_local` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees_local`
--

LOCK TABLES `employees_local` WRITE;
/*!40000 ALTER TABLE `employees_local` DISABLE KEYS */;
INSERT INTO `employees_local` VALUES
(1,'NHPC1001','Rahul Sharma',0,NULL,0.00,'2026-06-28 15:21:01'),
(2,'NHPC1002','Anjali Gupta',0,NULL,0.00,'2026-06-28 15:21:35');
/*!40000 ALTER TABLE `employees_local` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `ngo_id` int(11) NOT NULL,
  `self_assessment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`self_assessment`)),
  `ngo_assessment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ngo_assessment`)),
  `final_score` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`final_score`)),
  `recommendation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_eval_app` (`application_id`),
  CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations`
--

LOCK TABLES `evaluations` WRITE;
/*!40000 ALTER TABLE `evaluations` DISABLE KEYS */;
INSERT INTO `evaluations` VALUES
(1,3,'NHPC1001',1,'{\"hoursScore\":15,\"feedbackScore\":20,\"leadershipScore\":10,\"impactScore\":20,\"consistencyScore\":5}','{\"taskCompletion\":5,\"professionalism\":5,\"communityEngagement\":5,\"leadership\":5,\"overallSatisfaction\":5,\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"remarks\":\"\"}','{\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"total\":50}','Not Recommended','2026-06-28 19:03:35','2026-06-28 19:06:33'),
(2,4,'NHPC1001',1,NULL,NULL,'{\"hoursScore\":0,\"feedbackScore\":0,\"leadershipScore\":0,\"impactScore\":0,\"consistencyScore\":0,\"total\":0,\"isSubmitted\":true}','Not Recommended','2026-06-28 19:09:42','2026-06-28 19:09:42'),
(3,5,'NHPC1001',1,NULL,NULL,NULL,NULL,'2026-06-28 19:36:40','2026-06-28 19:36:40'),
(4,2,'NHPC1001',1,NULL,NULL,NULL,NULL,'2026-06-28 19:40:27','2026-06-28 19:40:27');
/*!40000 ALTER TABLE `evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ngos`
--

DROP TABLE IF EXISTS `ngos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ngos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT 'pass123',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngos`
--

LOCK TABLES `ngos` WRITE;
/*!40000 ALTER TABLE `ngos` DISABLE KEYS */;
INSERT INTO `ngos` VALUES
(1,'HealthCare Plus','health@care.org','Delhi','pass123'),
(2,'Green Earth','green@earth.org','Mumbai','pass123');
/*!40000 ALTER TABLE `ngos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ngos_local`
--

DROP TABLE IF EXISTS `ngos_local`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ngos_local` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngos_local`
--

LOCK TABLES `ngos_local` WRITE;
/*!40000 ALTER TABLE `ngos_local` DISABLE KEYS */;
INSERT INTO `ngos_local` VALUES
(1,'health@care.org','HealthCare Plus','Location not set');
/*!40000 ALTER TABLE `ngos_local` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteer_logs`
--

DROP TABLE IF EXISTS `volunteer_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteer_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `log_date` date NOT NULL,
  `activity_name` varchar(255) NOT NULL,
  `check_in_time` time NOT NULL,
  `check_out_time` time NOT NULL,
  `total_hours` decimal(5,2) NOT NULL,
  `ngo_status` varchar(50) DEFAULT 'PENDING',
  `verified_by_name` varchar(255) DEFAULT NULL,
  `verified_by_designation` varchar(255) DEFAULT NULL,
  `verified_on` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_log` (`application_id`,`log_date`),
  KEY `idx_logs_app` (`application_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_logs`
--

LOCK TABLES `volunteer_logs` WRITE;
/*!40000 ALTER TABLE `volunteer_logs` DISABLE KEYS */;
INSERT INTO `volunteer_logs` VALUES
(1,1,'NHPC1001','2026-06-28','testActivity','09:03:00','21:03:00',12.00,'APPROVED','HealthCare Plus','Authorized Person','2026-06-28 21:11:05','2026-06-28 15:33:51'),
(2,3,'NHPC1001','2026-06-28','test','11:12:00','23:12:00',12.00,'APPROVED','HealthCare Plus','Authorized Person','2026-06-28 23:12:22','2026-06-28 17:42:13');
/*!40000 ALTER TABLE `volunteer_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteer_postings`
--

DROP TABLE IF EXISTS `volunteer_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteer_postings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ngo_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `volunteers_needed` int(11) NOT NULL,
  `expected_hours` int(11) DEFAULT 0,
  `technical_skills` text DEFAULT NULL,
  `nature_of_work` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('OPEN','CLOSED') DEFAULT 'OPEN',
  PRIMARY KEY (`id`),
  KEY `ngo_id` (`ngo_id`),
  CONSTRAINT `volunteer_postings_ibfk_1` FOREIGN KEY (`ngo_id`) REFERENCES `ngos_local` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_postings`
--

LOCK TABLES `volunteer_postings` WRITE;
/*!40000 ALTER TABLE `volunteer_postings` DISABLE KEYS */;
INSERT INTO `volunteer_postings` VALUES
(1,1,'Tree Plantation Drive','NHPC Office Complex, Santosh Nagar, Sector 33, Faridabad, Haryana 121003',14,25,'','Environment','2026-06-28 15:23:37','OPEN'),
(2,1,'Animal Shelter','Khasra number 881, Siraspur Rd, near rd farm, Badli Industrial Area, Siraspur, New Delhi, Delhi, 110042',7,50,'','Animal Welfare','2026-06-28 15:45:32','OPEN');
/*!40000 ALTER TABLE `volunteer_postings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-29  1:54:54

--
-- Table structure for table `ngo_dept`
--

DROP TABLE IF EXISTS `ngo_dept`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ngo_dept` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'dept',
  `representative_name` varchar(255) DEFAULT NULL,
  `representative_mobile` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `ttl` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
