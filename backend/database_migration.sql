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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES
(4,'NHPC1001',1,'FORWARDED_TO_HR','/uploads/medical_cert_1782708489915.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:46:52.801Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:48:36.962Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"Anjali Gupta\",\"ro_designation\":\"testDesig\"},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:48:36.962Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:48:36.962Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:48:36.962Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:49:00.496Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:49:00.496Z\",\"note\":\"Application process complete.\"},{\"step\":8,\"title\":\"Terminated by Volunteer\",\"status\":\"TERMINATED\",\"date\":\"2026-06-29T04:54:17.090Z\",\"note\":\"Reason: testTerminationbyEmp\"},{\"step\":10,\"title\":\"Form-D Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:54:39.133Z\",\"note\":\"NGO has submitted partner organization feedback.\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T04:55:50.362Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-06-29T05:19:04.263Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"}]','2026-06-29 04:46:52','2026-06-29 05:19:04',NULL,NULL),
(5,'NHPC1001',2,'Acknowledged and all set','/uploads/medical_cert_1782846957168.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T19:15:57.206Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T19:30:15.524Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"Anjali Gupta\",\"ro_designation\":\"Reporting Officer=\"},{\"step\":3,\"title\":\"Forwarded to CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T19:30:15.524Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Forwarded to HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T19:30:15.524Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T19:30:15.524Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T19:30:34.856Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T19:30:34.856Z\",\"note\":\"Application process complete.\"}]','2026-06-30 19:15:57','2026-06-30 19:30:34',NULL,NULL),
(6,'NHPC1001',2,'Acknowledged and all set','/uploads/medical_cert_1782850552325.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:15:52.328Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:16:24.617Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"Anjali Gupta\",\"ro_designation\":\"Reporting Officer\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:16:24.617Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:16:24.617Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:16:24.617Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:20:56.238Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:20:56.238Z\",\"note\":\"Application process complete.\"}]','2026-06-30 20:15:52','2026-06-30 20:20:56',NULL,NULL),
(7,'NHPC1001',2,'APPLIED','/uploads/medical_cert_1782852560271.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:49:20.273Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"PENDING\",\"date\":null},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"PENDING\",\"date\":null},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"PENDING\",\"date\":null},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"PENDING\",\"date\":null},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-06-30 20:49:20','2026-06-30 20:49:20',NULL,NULL),
(8,'NHPC1001',2,'APPLIED','/uploads/medical_cert_1782852849155.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-06-30T20:54:09.162Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"PENDING\",\"date\":null},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"PENDING\",\"date\":null},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"PENDING\",\"date\":null},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"PENDING\",\"date\":null},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-06-30 20:54:09','2026-06-30 20:54:09',NULL,NULL),
(9,'103593T',2,'RO_APPROVED','/uploads/medical_cert_1783018676942.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T18:57:56.956Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:08:33.626Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:08:33.626Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:08:33.626Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:08:33.626Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-07-02 18:57:56','2026-07-02 19:08:33','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-04\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-04\"]}}',NULL),
(10,'103593T',2,'REJECTED','/uploads/medical_cert_1783018849155.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:00:49.159Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"REJECTED\",\"date\":\"2026-07-02T19:10:40.199Z\",\"note\":\"RO Review: REJECTED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"PENDING\",\"date\":null},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"PENDING\",\"date\":null},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"PENDING\",\"date\":null},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-07-02 19:00:49','2026-07-02 19:10:40','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-11\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-11\"]}}',NULL),
(11,'103593T',2,'RO_APPROVED','/uploads/medical_cert_1783018985101.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:03:05.104Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:10:51.003Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:10:51.003Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:10:51.003Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:10:51.003Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-07-02 19:03:05','2026-07-02 19:10:51','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-25\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-25\"]}}',NULL),
(12,'103593T',2,'RO_APPROVED','/uploads/medical_cert_1783019487651.pdf','[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T19:11:27.657Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:05:15.729Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:05:15.729Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:05:15.729Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:05:15.729Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-07-02 19:11:27','2026-07-02 20:05:19','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-10\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-10\"]}}',NULL),
(13,'103593T',3,'APPLIED',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:06:39.839Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"PENDING\",\"date\":null},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"PENDING\",\"date\":null},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"PENDING\",\"date\":null},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"PENDING\",\"date\":null},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-07-02 20:06:39','2026-07-02 20:06:39','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-16\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-16\"]}}',NULL),
(14,'103593T',3,'APPLIED',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:07:57.329Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"PENDING\",\"date\":null},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"PENDING\",\"date\":null},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"PENDING\",\"date\":null},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"PENDING\",\"date\":null},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-07-02 20:07:57','2026-07-02 20:07:57','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-15\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-15\"]}}',NULL),
(15,'103593T',3,'FORWARDED_TO_HR',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:09:11.354Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:09:27.976Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:09:27.976Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:09:27.976Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:09:27.976Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:30:08.627Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:30:08.627Z\",\"note\":\"Application process complete.\"},{\"step\":8,\"title\":\"Terminated by Volunteer\",\"status\":\"TERMINATED\",\"date\":\"2026-07-02T20:36:07.600Z\",\"note\":\"Reason: None provided\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:36:29.380Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:36:31.390Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:50:52.880Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"}]','2026-07-02 20:09:11','2026-07-03 08:50:52','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-14\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-14\"]}}',NULL),
(16,'103593T',3,'FORWARDED_TO_HR',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:21:32.047Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:22:58.795Z\",\"note\":\"RO Review: APPROVED. Remarks: LGTM\",\"ro_name\":\"Self RO\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:22:58.795Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:22:58.795Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:22:58.795Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:23:01.591Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:23:01.591Z\",\"note\":\"Application process complete.\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:23:01.604Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:23:05.441Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"}]','2026-07-02 20:21:32','2026-07-02 20:23:05','{\"contact\":\"1234567890\",\"dates\":{\"dates\":[\"2026-07-06\"]},\"ro_contact\":\"1234567890\"}','{\"formC\":{\"sectionA\":{\"hours_completed\":8,\"achievements\":\"Finished everything\",\"challenges\":\"None\",\"submittedAt\":\"2026-07-02T20:23:01.604Z\",\"signature\":\"AKSHAY KUMAR\"},\"sectionB\":{\"action\":\"APPROVED\",\"comments\":\"Good job\",\"managerName\":\"Self RO\",\"submittedAt\":\"2026-07-02T20:23:05.441Z\",\"signature\":\"AKSHAY KUMAR\"}}}'),
(17,'103593T',3,'FORWARDED_TO_HR',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:23:33.666Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:37.081Z\",\"note\":\"RO Review: APPROVED. Remarks: LGTM\",\"ro_name\":\"Self RO\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:37.081Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:37.081Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:37.081Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:40.576Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:40.576Z\",\"note\":\"Application process complete.\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:23:36.223Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:23:39.135Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:40.583Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:43.366Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"},{\"step\":10,\"title\":\"Form-D Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:28:43.374Z\",\"note\":\"NGO has submitted partner organization feedback.\"}]','2026-07-02 20:23:33','2026-07-02 20:28:43','{\"contact\":\"1234567890\",\"dates\":{\"dates\":[\"2026-08-01\"]},\"ro_contact\":\"1234567890\"}','{\"formC\":{\"sectionA\":{\"hours_completed\":8,\"achievements\":\"Finished everything\",\"challenges\":\"None\",\"submittedAt\":\"2026-07-02T20:23:36.223Z\",\"signature\":\"AKSHAY KUMAR\"},\"sectionB\":{\"action\":\"APPROVED\",\"comments\":\"Good job\",\"managerName\":\"Self RO\",\"submittedAt\":\"2026-07-02T20:23:39.135Z\",\"signature\":\"AKSHAY KUMAR\"}}}'),
(18,'103593T',4,'RO_APPROVED',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:50:58.856Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:51:32.923Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:51:32.923Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:51:32.923Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:51:32.923Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"PENDING\",\"date\":null},{\"step\":7,\"title\":\"All Set\",\"status\":\"PENDING\",\"date\":null}]','2026-07-02 20:50:58','2026-07-02 20:51:35','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-13\",\"2026-07-20\",\"2026-07-27\"],\"dates\":{\"noOfDates\":3,\"dates\":[\"2026-07-13\",\"2026-07-20\",\"2026-07-27\"]}}',NULL),
(19,'103593T',4,'PENDING_RO_COMPLETION',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:53:25.705Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:55:39.984Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:55:39.984Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:55:39.984Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:55:39.984Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:56:07.652Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-07-02T20:56:07.652Z\",\"note\":\"Application process complete.\"},{\"step\":8,\"title\":\"Terminated by Volunteer\",\"status\":\"TERMINATED\",\"date\":\"2026-07-03T08:30:28.017Z\",\"note\":\"Reason: None provided\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:31:06.066Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:31:07.169Z\",\"note\":\"Employee has submitted their volunteering completion report.\"}]','2026-07-02 20:53:25','2026-07-03 08:31:07','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-12\",\"2026-07-19\",\"2026-07-26\"],\"dates\":{\"noOfDates\":3,\"dates\":[\"2026-07-12\",\"2026-07-19\",\"2026-07-26\"]}}',NULL),
(20,'103593T',5,'FORWARDED_TO_HR',NULL,'[{\"step\":1,\"title\":\"Applied\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:45:35.688Z\",\"note\":\"Application submitted successfully.\"},{\"step\":2,\"title\":\"R.O. Approval\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:46:26.188Z\",\"note\":\"RO Review: APPROVED. Remarks: None\",\"ro_name\":\"AKSHAY KUMAR\",\"ro_designation\":\"CEO\"},{\"step\":3,\"title\":\"Recorded at CSR & SD\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:46:26.188Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":4,\"title\":\"Recorded at HR/T&HRD division\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:46:26.188Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":5,\"title\":\"Forwarded to NGO\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:46:26.188Z\",\"note\":\"System: Automatically forwarded.\"},{\"step\":6,\"title\":\"Waiting Acknowledgement\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:46:57.172Z\",\"note\":\"NGO Accepted the volunteer\"},{\"step\":7,\"title\":\"All Set\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:46:57.172Z\",\"note\":\"Application process complete.\"},{\"step\":8,\"title\":\"Terminated by Volunteer\",\"status\":\"TERMINATED\",\"date\":\"2026-07-03T08:48:46.809Z\",\"note\":\"Reason: None provided\"},{\"step\":9,\"title\":\"Form-C Section A Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:49:16.356Z\",\"note\":\"Employee has submitted their volunteering completion report.\"},{\"step\":10,\"title\":\"Form-D Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:50:01.345Z\",\"note\":\"NGO has submitted partner organization feedback.\"},{\"step\":10,\"title\":\"Form-D Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:51:43.007Z\",\"note\":\"NGO has submitted partner organization feedback.\"},{\"step\":11,\"title\":\"Form-C Section B Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:52:36.825Z\",\"note\":\"Reporting Officer has submitted their acceptance.\"},{\"step\":10,\"title\":\"Form-D Submitted\",\"status\":\"COMPLETED\",\"date\":\"2026-07-03T08:53:22.880Z\",\"note\":\"NGO has submitted partner organization feedback.\"}]','2026-07-03 08:45:35','2026-07-03 08:53:22','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-07\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-07\"]}}',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
INSERT INTO `approvals` VALUES
(1,4,'NHPC1001','NHPC1002','Reporting Officer for NHPC1001','APPROVED','2026-06-29 04:46:52'),
(2,5,'NHPC1001','NHPC1002','Reporting Officer for NHPC1001','APPROVED','2026-06-30 19:15:57'),
(3,6,'NHPC1001','NHPC1002','Reporting Officer for NHPC1001','APPROVED','2026-06-30 20:15:52'),
(4,7,'NHPC1001','NHPC1002','Reporting Officer for NHPC1001','PENDING','2026-06-30 20:49:20'),
(5,8,'NHPC1001','NHPC1002','Reporting Officer for NHPC1001','PENDING','2026-06-30 20:54:09'),
(6,9,'103593T','103593T','103593T','APPROVED','2026-07-02 18:57:56'),
(7,10,'103593T','103593T','103593T','REJECTED','2026-07-02 19:00:49'),
(8,11,'103593T','103593T','103593T','APPROVED','2026-07-02 19:03:05'),
(9,12,'103593T','103593T','Manager / RO','APPROVED','2026-07-02 19:11:27'),
(10,13,'103593T','103405T','Manager / RO','PENDING','2026-07-02 20:06:39'),
(11,14,'103593T','103405T','Manager / RO','PENDING','2026-07-02 20:07:57'),
(12,15,'103593T','103593T','Manager / RO','APPROVED','2026-07-02 20:09:11'),
(13,16,'103593T','103593T','Test RO','APPROVED','2026-07-02 20:21:32'),
(14,17,'103593T','103593T','Test RO','APPROVED','2026-07-02 20:23:33'),
(15,18,'103593T','103593T','Manager / RO','APPROVED','2026-07-02 20:50:58'),
(16,19,'103593T','103593T','Manager / RO','APPROVED','2026-07-02 20:53:25'),
(17,20,'103593T','103593T','Manager / RO','APPROVED','2026-07-03 08:45:35');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dept_local`
--

LOCK TABLES `dept_local` WRITE;
/*!40000 ALTER TABLE `dept_local` DISABLE KEYS */;
INSERT INTO `dept_local` VALUES
(1,'DEPT-CSR','CSR & SD Division','2026-06-29 04:51:08');
/*!40000 ALTER TABLE `dept_local` ENABLE KEYS */;
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
  `designation` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `reporting_officer` varchar(255) DEFAULT NULL,
  `reporting_officer_mobile` varchar(50) DEFAULT NULL,
  `reporting_officer_email` varchar(255) DEFAULT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `ttl` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees_local`
--

LOCK TABLES `employees_local` WRITE;
/*!40000 ALTER TABLE `employees_local` DISABLE KEYS */;
INSERT INTO `employees_local` VALUES
(1,'NHPC1001','Rahul Sharma',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,'NHPC1002','Anjali Gupta',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,'103593T','AKSHAY KUMAR','CEO','IT & Comm','sunilbiswakarma@nhpc.nic.in','7905055458','103593T','7905055458','tapan@nhpc.nic.in',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations`
--

LOCK TABLES `evaluations` WRITE;
/*!40000 ALTER TABLE `evaluations` DISABLE KEYS */;
INSERT INTO `evaluations` VALUES
(1,4,'NHPC1001',1,'{\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"isSubmitted\":true}','{\"taskCompletion\":5,\"professionalism\":5,\"communityEngagement\":5,\"leadership\":5,\"overallSatisfaction\":5,\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"remarks\":\"test\",\"isSubmitted\":true}','{\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"total\":50,\"isSubmitted\":true}','Not Recommended','2026-06-29 04:55:15','2026-06-29 05:14:59'),
(2,20,'103593T',5,'{\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"isSubmitted\":true}','{\"taskCompletion\":5,\"professionalism\":5,\"communityEngagement\":5,\"leadership\":5,\"overallSatisfaction\":5,\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"remarks\":\"10\",\"isSubmitted\":true}','{\"hoursScore\":10,\"feedbackScore\":10,\"leadershipScore\":10,\"impactScore\":10,\"consistencyScore\":10,\"total\":50}','Not Recommended','2026-07-03 08:54:11','2026-07-03 09:04:17');
/*!40000 ALTER TABLE `evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `formA` longtext DEFAULT NULL,
  `formB` longtext DEFAULT NULL,
  `formC` longtext DEFAULT NULL,
  `formD` longtext DEFAULT NULL,
  `formE` tinyint(1) DEFAULT 0,
  `formG` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `forms_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `forms_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees_local` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
INSERT INTO `forms` VALUES
(1,4,'NHPC1001','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"testDesig\",\"department\":\"test\",\"contact\":\"7777777777\",\"email\":\"test@test\",\"fromDate\":\"2026-06-29\",\"toDate\":\"2026-06-29\"}',NULL,'{\"sectionA\": {\"overview\": \"test\", \"contributions\": \"test\", \"learnings\": \"test\", \"challenges\": \"test\", \"suggestions\": \"test\", \"comments\": \"test\", \"submittedAt\": \"2026-06-29T04:55:50.362Z\", \"signature\": \"Rahul Sharma\"}, \"sectionB\": {\"comments\": \"approved\", \"managerDesignation\": \"Reporting Officer\", \"submittedAt\": \"2026-06-29T05:19:04.263Z\", \"signature\": \"Anjali Gupta\"}}','{\"taskDetails\": \"test\", \"quality\": \"test\", \"impact\": \"test\", \"suggestionsNHPC\": \"test\", \"submittedAt\": \"2026-06-29T04:54:39.133Z\", \"signature\": \"HealthCare Plus\"}',0,NULL,'2026-07-01 17:43:59','2026-07-01 17:45:40'),
(2,5,'NHPC1001','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"test\",\"department\":\"test\",\"contact\":\"8888888888\",\"email\":\"test@test\",\"selectedDates\":[\"2026-07-04\",\"2026-07-11\",\"2026-07-18\",\"2026-07-25\",\"2026-08-01\"],\"dates\":{\"noOfDates\":5,\"dates\":[\"2026-07-04\",\"2026-07-11\",\"2026-07-18\",\"2026-07-25\",\"2026-08-01\"]}}',NULL,NULL,NULL,0,NULL,'2026-07-01 17:43:59','2026-07-01 17:43:59'),
(3,6,'NHPC1001','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"test\",\"department\":\"test\",\"contact\":\"7777777777\",\"email\":\"test@test\",\"selectedDates\":[\"2026-07-08\",\"2026-07-15\",\"2026-07-22\",\"2026-07-29\"],\"dates\":{\"noOfDates\":4,\"dates\":[\"2026-07-08\",\"2026-07-15\",\"2026-07-22\",\"2026-07-29\"]}}',NULL,NULL,NULL,0,NULL,'2026-07-01 17:43:59','2026-07-01 17:43:59'),
(4,7,'NHPC1001','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"asdbh\",\"department\":\"hahsg\",\"contact\":\"7777777777\",\"email\":\"asdada@sadas\",\"ro_contact\":\"7777777777\",\"selectedDates\":[\"2026-07-12\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-12\"]}}',NULL,NULL,NULL,0,NULL,'2026-07-01 17:43:59','2026-07-01 17:43:59'),
(5,8,'NHPC1001','{\"name\":\"Rahul Sharma\",\"id\":\"NHPC1001\",\"designation\":\"asca\",\"department\":\"adsdc\",\"contact\":\"7777777777\",\"email\":\"aa@hhbh\",\"ro_contact\":\"7777777777\",\"selectedDates\":[\"2026-07-13\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-13\"]}}',NULL,NULL,NULL,0,NULL,'2026-07-01 17:43:59','2026-07-01 17:43:59'),
(6,9,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-04\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-04\"]},\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-02T19:08:33.628Z\"}}',NULL,NULL,NULL,1,NULL,'2026-07-02 18:57:56','2026-07-02 19:08:33'),
(7,10,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-11\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-11\"]},\"sectionD\":{\"status\":\"REJECTED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-02T19:10:40.200Z\"}}',NULL,NULL,NULL,1,NULL,'2026-07-02 19:00:49','2026-07-02 19:10:40'),
(8,11,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-25\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-25\"]},\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-02T19:10:51.004Z\"}}',NULL,NULL,NULL,1,NULL,'2026-07-02 19:03:05','2026-07-02 19:10:51'),
(9,12,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-10\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-10\"]},\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-02T20:05:19.958Z\"}}',NULL,NULL,NULL,1,NULL,'2026-07-02 19:11:27','2026-07-02 20:05:19'),
(10,13,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-16\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-16\"]}}',NULL,NULL,NULL,1,NULL,'2026-07-02 20:06:39','2026-07-02 20:06:39'),
(11,14,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-15\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-15\"]}}',NULL,NULL,NULL,1,NULL,'2026-07-02 20:07:57','2026-07-02 20:07:57'),
(12,15,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-14\"],\"dates\":{\"noOfDates\":1,\"dates\":[\"2026-07-14\"]},\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-02T20:09:31.649Z\"},\"toDate\":\"2026-07-02\"}',NULL,'{\"sectionA\":{\"overview\":\"test\",\"contributions\":\"test\",\"learnings\":\"test\",\"challenges\":\"test\",\"suggestions\":\"test\",\"comments\":\"test\",\"submittedAt\":\"2026-07-02T20:36:31.390Z\",\"signature\":\"AKSHAY KUMAR\"},\"sectionB\":{\"comments\":\"sdasd\",\"managerDesignation\":\"CEO\",\"submittedAt\":\"2026-07-03T08:50:52.880Z\",\"signature\":\"AKSHAY KUMAR\"}}',NULL,1,NULL,'2026-07-02 20:09:11','2026-07-03 08:50:52'),
(13,16,'103593T','{\"contact\":\"1234567890\",\"dates\":{\"dates\":[\"2026-07-06\"]},\"ro_contact\":\"1234567890\",\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"LGTM\",\"signature\":\"Self RO\",\"date\":\"2026-07-02T20:23:01.586Z\"}}',NULL,'{\"sectionA\":{\"hours_completed\":8,\"achievements\":\"Finished everything\",\"challenges\":\"None\",\"submittedAt\":\"2026-07-02T20:23:01.604Z\",\"signature\":\"AKSHAY KUMAR\"}}',NULL,1,NULL,'2026-07-02 20:21:32','2026-07-02 20:23:01'),
(14,17,'103593T','{\"contact\":\"1234567890\",\"dates\":{\"dates\":[\"2026-08-01\"]},\"ro_contact\":\"1234567890\",\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"LGTM\",\"signature\":\"Self RO\",\"date\":\"2026-07-02T20:28:40.572Z\"}}',NULL,'{\"sectionA\":{\"hours_completed\":8,\"achievements\":\"Finished everything\",\"challenges\":\"None\",\"submittedAt\":\"2026-07-02T20:28:40.583Z\",\"signature\":\"AKSHAY KUMAR\"},\"sectionB\":{\"action\":\"APPROVED\",\"comments\":\"Good job\",\"managerName\":\"Self RO\",\"submittedAt\":\"2026-07-02T20:28:43.366Z\",\"signature\":\"AKSHAY KUMAR\"}}','{\"performance\":\"Excellent\",\"recommendation\":\"Highly recommended\",\"comments\":\"Great volunteer!\",\"submittedAt\":\"2026-07-02T20:28:43.374Z\",\"signature\":\"testNGO\"}',1,NULL,'2026-07-02 20:23:33','2026-07-02 20:28:43'),
(15,18,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-13\",\"2026-07-20\",\"2026-07-27\"],\"dates\":{\"noOfDates\":3,\"dates\":[\"2026-07-13\",\"2026-07-20\",\"2026-07-27\"]},\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-02T20:51:35.666Z\"}}',NULL,NULL,NULL,1,NULL,'2026-07-02 20:50:58','2026-07-02 20:51:35'),
(16,19,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-12\",\"2026-07-19\",\"2026-07-26\"],\"dates\":{\"noOfDates\":3,\"dates\":[]},\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-02T20:55:43.717Z\"},\"toDate\":\"2026-07-03\"}',NULL,'{\"sectionA\":{\"overview\":\"QAywgd\",\"contributions\":\"jaghsvd\",\"learnings\":\"uyabvda\",\"challenges\":\"asdas\\n\",\"suggestions\":\"ydbasud\",\"comments\":\"vuhasvd\",\"submittedAt\":\"2026-07-03T08:31:07.169Z\",\"signature\":\"AKSHAY KUMAR\"}}',NULL,1,NULL,'2026-07-02 20:53:25','2026-07-03 08:31:07'),
(17,20,'103593T','{\"name\":\"AKSHAY KUMAR\",\"id\":\"103593T\",\"designation\":\"CEO\",\"department\":\"IT & Comm\",\"contact\":\"7905055458\",\"email\":\"sunilbiswakarma@nhpc.nic.in\",\"ro_contact\":\"\",\"selectedDates\":[\"2026-07-07\"],\"dates\":{\"noOfDates\":1,\"dates\":[]},\"sectionD\":{\"status\":\"APPROVED\",\"comments\":\"\",\"signature\":\"AKSHAY KUMAR\",\"date\":\"2026-07-03T08:46:31.932Z\"},\"toDate\":\"2026-07-03\"}',NULL,'{\"sectionA\":{\"overview\":\"sasd\",\"contributions\":\"asdas\",\"learnings\":\"dasda\",\"challenges\":\"adasd\",\"suggestions\":\"asdas\",\"comments\":\"asdad\",\"submittedAt\":\"2026-07-03T08:49:16.356Z\",\"signature\":\"AKSHAY KUMAR\"},\"sectionB\":{\"comments\":\"sddfsd\",\"managerDesignation\":\"CEO\",\"submittedAt\":\"2026-07-03T08:52:36.825Z\",\"signature\":\"AKSHAY KUMAR\"}}','{\"taskDetails\":\"a\",\"quality\":\"a\",\"impact\":\"a\",\"suggestionsNHPC\":\"a\",\"submittedAt\":\"2026-07-03T08:53:22.880Z\",\"signature\":\"nhpc\"}',1,NULL,'2026-07-03 08:45:35','2026-07-03 08:53:22');
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;

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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `representative_name` varchar(255) DEFAULT NULL,
  `representative_mobile` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `ttl` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngo_dept`
--

LOCK TABLES `ngo_dept` WRITE;
/*!40000 ALTER TABLE `ngo_dept` DISABLE KEYS */;
INSERT INTO `ngo_dept` VALUES
(1,'CSR','$2b$10$2Okbrn1j94qc9I7OpfxIFek0R8QXNKPjEBl38XUHYQSnOco0RaXGe','ugbhartariya@gmail.com','dept','2026-07-02 19:26:35','2026-07-03 08:23:37',NULL,NULL,NULL,NULL,NULL),
(2,'testNGO','$2b$10$2Okbrn1j94qc9I7OpfxIFek0R8QXNKPjEBl38XUHYQSnOco0RaXGe','ugbhartariya1@gmail.com','ngo','2026-07-02 19:30:07','2026-07-03 08:21:41','testREP','7777777777','fbd',NULL,NULL),
(5,'nhpc','$2b$10$oecyHVfG0zwdR5.L/0YI1.79tNyTvQAwONqPqoMGW0E8/qZGw5du2','tavishrja786@gmail.com','ngo','2026-07-03 08:40:51','2026-07-03 08:41:47','tavish','9711007789','fbd',NULL,NULL);
/*!40000 ALTER TABLE `ngo_dept` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngos`
--

LOCK TABLES `ngos` WRITE;
/*!40000 ALTER TABLE `ngos` DISABLE KEYS */;
INSERT INTO `ngos` VALUES
(1,'HealthCare Plus','health@care.org','Delhi','pass123'),
(2,'Green Earth','green@earth.org','Mumbai','pass123'),
(3,'testNGo','tes','test','pass123'),
(4,'testNGO2','test@test.com','asda','pass123');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngos_local`
--

LOCK TABLES `ngos_local` WRITE;
/*!40000 ALTER TABLE `ngos_local` DISABLE KEYS */;
INSERT INTO `ngos_local` VALUES
(1,'health@care.org','HealthCare Plus','Location not set'),
(2,'tes','testNGo','test'),
(3,'test@test.com','testNGO2','asda'),
(4,'ugbhartariya1@gmail.com','testNGO','fbd'),
(5,'tavishrja786@gmail.com','nhpc','fbd');
/*!40000 ALTER TABLE `ngos_local` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `key_name` varchar(255) NOT NULL,
  `key_value` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES
('certificate_threshold','40');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_logs`
--

LOCK TABLES `volunteer_logs` WRITE;
/*!40000 ALTER TABLE `volunteer_logs` DISABLE KEYS */;
INSERT INTO `volunteer_logs` VALUES
(1,4,'NHPC1001','2026-06-29','test','10:23:00','22:23:00',12.00,'APPROVED','HealthCare Plus','Authorized Person','2026-06-29 10:23:47','2026-06-29 04:53:16'),
(2,5,'NHPC1001','2026-07-04','asdsasd','01:22:00','13:22:00',12.00,'APPROVED','HealthCare Plus','Authorized Person','2026-07-01 01:51:00','2026-06-30 19:52:29'),
(4,16,'103593T','2026-07-06','Testing Activity','09:00:00','17:00:00',8.00,'APPROVED','testNGO','Authorized Person','2026-07-03 02:03:14','2026-07-02 20:22:23'),
(6,17,'103593T','2026-07-06','Testing Activity','09:00:00','17:00:00',8.00,'APPROVED','testNGO','Authorized Person','2026-07-03 02:03:25','2026-07-02 20:23:36'),
(8,15,'103593T','2026-07-14','test','02:00:00','14:00:00',12.00,'APPROVED','testNGO','Authorized Person','2026-07-03 02:05:50','2026-07-02 20:30:35'),
(10,20,'103593T','2026-07-07','zdfsdfs','02:17:00','14:17:00',12.00,'APPROVED','nhpc','Authorized Person','2026-07-03 14:17:45','2026-07-03 08:47:34');
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
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `medical_required` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ngo_id` (`ngo_id`),
  CONSTRAINT `volunteer_postings_ibfk_1` FOREIGN KEY (`ngo_id`) REFERENCES `ngos_local` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_postings`
--

LOCK TABLES `volunteer_postings` WRITE;
/*!40000 ALTER TABLE `volunteer_postings` DISABLE KEYS */;
INSERT INTO `volunteer_postings` VALUES
(1,1,'testTitile','Faridabad',9,50,'testSkill','testOthers','2026-06-29 04:43:14','CLOSED',NULL,NULL,0),
(2,1,'Tree Plantation Drive','Hyderabad',8,50,'Web Dev','Community Development','2026-06-30 18:34:52','OPEN','2026-07-04','2026-08-04',1),
(3,4,'test','test',0,50,'test','test','2026-07-02 20:02:56','CLOSED','2026-07-10','2026-07-31',0),
(4,4,'test','test',4,10,'test','test','2026-07-02 20:41:45','OPEN','2026-07-03','2026-08-03',0),
(5,5,'slums kids ','fbd',1,4,'nothing','Education','2026-07-03 08:42:59','OPEN','2026-07-04','2026-07-13',0);
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

-- Dump completed on 2026-07-03 16:09:02
