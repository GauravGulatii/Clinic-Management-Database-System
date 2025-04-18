--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment (
    patientid integer NOT NULL,
    appointmentid integer NOT NULL,
    appointmentdate date NOT NULL,
    appointmenttime time without time zone NOT NULL,
    doctorid integer NOT NULL,
    staffid integer NOT NULL,
    scheduleid integer
);


ALTER TABLE public.appointment OWNER TO postgres;

--
-- Name: billing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing (
    billingid integer NOT NULL,
    amount numeric(10,2),
    paymentstatus character varying(50),
    patientid integer NOT NULL,
    appointmentid integer NOT NULL,
    staffid integer
);


ALTER TABLE public.billing OWNER TO postgres;

--
-- Name: billing_billingid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.billing_billingid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.billing_billingid_seq OWNER TO postgres;

--
-- Name: billing_billingid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.billing_billingid_seq OWNED BY public.billing.billingid;


--
-- Name: clinicstaff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinicstaff (
    staffid integer NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(50),
    contactinfo character varying(200)
);


ALTER TABLE public.clinicstaff OWNER TO postgres;

--
-- Name: clinicstaff_staffid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinicstaff_staffid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinicstaff_staffid_seq OWNER TO postgres;

--
-- Name: clinicstaff_staffid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinicstaff_staffid_seq OWNED BY public.clinicstaff.staffid;


--
-- Name: doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor (
    doctorid integer NOT NULL,
    name character varying(100) NOT NULL,
    specialization character varying(100)
);


ALTER TABLE public.doctor OWNER TO postgres;

--
-- Name: doctor_doctorid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_doctorid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_doctorid_seq OWNER TO postgres;

--
-- Name: doctor_doctorid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_doctorid_seq OWNED BY public.doctor.doctorid;


--
-- Name: doctorschedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctorschedule (
    scheduleid integer NOT NULL,
    doctorid integer NOT NULL,
    scheduledate date NOT NULL,
    starttime time without time zone NOT NULL,
    endtime time without time zone NOT NULL,
    status character varying(50)
);


ALTER TABLE public.doctorschedule OWNER TO postgres;

--
-- Name: doctorschedule_scheduleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctorschedule_scheduleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctorschedule_scheduleid_seq OWNER TO postgres;

--
-- Name: doctorschedule_scheduleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctorschedule_scheduleid_seq OWNED BY public.doctorschedule.scheduleid;


--
-- Name: medicalrecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicalrecord (
    recordid integer NOT NULL,
    diagnosis text,
    treatment text,
    patientid integer NOT NULL,
    appointmentid integer NOT NULL
);


ALTER TABLE public.medicalrecord OWNER TO postgres;

--
-- Name: medicalrecord_recordid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicalrecord_recordid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicalrecord_recordid_seq OWNER TO postgres;

--
-- Name: medicalrecord_recordid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicalrecord_recordid_seq OWNED BY public.medicalrecord.recordid;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    patientid integer NOT NULL,
    firstname character varying(100) NOT NULL,
    lastname character varying(100) NOT NULL,
    dob date NOT NULL
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: patient_patientid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_patientid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_patientid_seq OWNER TO postgres;

--
-- Name: patient_patientid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_patientid_seq OWNED BY public.patient.patientid;


--
-- Name: prescription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription (
    prescriptionid integer NOT NULL,
    medication character varying(100) NOT NULL,
    dosage character varying(50),
    patientid integer NOT NULL,
    appointmentid integer NOT NULL
);


ALTER TABLE public.prescription OWNER TO postgres;

--
-- Name: prescription_prescriptionid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_prescriptionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_prescriptionid_seq OWNER TO postgres;

--
-- Name: prescription_prescriptionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_prescriptionid_seq OWNED BY public.prescription.prescriptionid;


--
-- Name: billing billingid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing ALTER COLUMN billingid SET DEFAULT nextval('public.billing_billingid_seq'::regclass);


--
-- Name: clinicstaff staffid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinicstaff ALTER COLUMN staffid SET DEFAULT nextval('public.clinicstaff_staffid_seq'::regclass);


--
-- Name: doctor doctorid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor ALTER COLUMN doctorid SET DEFAULT nextval('public.doctor_doctorid_seq'::regclass);


--
-- Name: doctorschedule scheduleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctorschedule ALTER COLUMN scheduleid SET DEFAULT nextval('public.doctorschedule_scheduleid_seq'::regclass);


--
-- Name: medicalrecord recordid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicalrecord ALTER COLUMN recordid SET DEFAULT nextval('public.medicalrecord_recordid_seq'::regclass);


--
-- Name: patient patientid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient ALTER COLUMN patientid SET DEFAULT nextval('public.patient_patientid_seq'::regclass);


--
-- Name: prescription prescriptionid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription ALTER COLUMN prescriptionid SET DEFAULT nextval('public.prescription_prescriptionid_seq'::regclass);


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment (patientid, appointmentid, appointmentdate, appointmenttime, doctorid, staffid, scheduleid) FROM stdin;
\.


--
-- Data for Name: billing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing (billingid, amount, paymentstatus, patientid, appointmentid, staffid) FROM stdin;
\.


--
-- Data for Name: clinicstaff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinicstaff (staffid, name, role, contactinfo) FROM stdin;
1	Sarah Gray	Receptionist	sarah@clinic.com
\.


--
-- Data for Name: doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor (doctorid, name, specialization) FROM stdin;
1	Dr. Smith	General Medicine
2	Dr. Johnson	Cardiology
3	Dr Ross	Brain
\.


--
-- Data for Name: doctorschedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctorschedule (scheduleid, doctorid, scheduledate, starttime, endtime, status) FROM stdin;
1	2	2025-04-18	01:38:00	13:38:00	Available
2	3	2025-04-18	00:39:00	12:40:00	Available
3	3	2025-04-18	00:45:00	12:45:00	Unavailable
\.


--
-- Data for Name: medicalrecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicalrecord (recordid, diagnosis, treatment, patientid, appointmentid) FROM stdin;
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (patientid, firstname, lastname, dob) FROM stdin;
2	Alice	Smith	1995-02-14
3	Gaurav_Test	Test	2025-04-17
4	John	Minaz	1999-01-17
\.


--
-- Data for Name: prescription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription (prescriptionid, medication, dosage, patientid, appointmentid) FROM stdin;
\.


--
-- Name: billing_billingid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.billing_billingid_seq', 1, false);


--
-- Name: clinicstaff_staffid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clinicstaff_staffid_seq', 1, true);


--
-- Name: doctor_doctorid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_doctorid_seq', 3, true);


--
-- Name: doctorschedule_scheduleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctorschedule_scheduleid_seq', 3, true);


--
-- Name: medicalrecord_recordid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicalrecord_recordid_seq', 1, false);


--
-- Name: patient_patientid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_patientid_seq', 5, true);


--
-- Name: prescription_prescriptionid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescription_prescriptionid_seq', 1, false);


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (patientid, appointmentid);


--
-- Name: billing billing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_pkey PRIMARY KEY (billingid);


--
-- Name: clinicstaff clinicstaff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinicstaff
    ADD CONSTRAINT clinicstaff_pkey PRIMARY KEY (staffid);


--
-- Name: doctor doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_pkey PRIMARY KEY (doctorid);


--
-- Name: doctorschedule doctorschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctorschedule
    ADD CONSTRAINT doctorschedule_pkey PRIMARY KEY (scheduleid);


--
-- Name: medicalrecord medicalrecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicalrecord
    ADD CONSTRAINT medicalrecord_pkey PRIMARY KEY (recordid);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (patientid);


--
-- Name: prescription prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_pkey PRIMARY KEY (prescriptionid);


--
-- Name: appointment appointment_doctorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_doctorid_fkey FOREIGN KEY (doctorid) REFERENCES public.doctor(doctorid) ON DELETE CASCADE;


--
-- Name: appointment appointment_scheduleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_scheduleid_fkey FOREIGN KEY (scheduleid) REFERENCES public.doctorschedule(scheduleid) ON DELETE SET NULL;


--
-- Name: appointment appointment_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.clinicstaff(staffid) ON DELETE CASCADE;


--
-- Name: billing billing_patientid_appointmentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_patientid_appointmentid_fkey FOREIGN KEY (patientid, appointmentid) REFERENCES public.appointment(patientid, appointmentid) ON DELETE CASCADE;


--
-- Name: billing billing_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.clinicstaff(staffid) ON DELETE SET NULL;


--
-- Name: doctorschedule doctorschedule_doctorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctorschedule
    ADD CONSTRAINT doctorschedule_doctorid_fkey FOREIGN KEY (doctorid) REFERENCES public.doctor(doctorid) ON DELETE CASCADE;


--
-- Name: medicalrecord medicalrecord_patientid_appointmentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicalrecord
    ADD CONSTRAINT medicalrecord_patientid_appointmentid_fkey FOREIGN KEY (patientid, appointmentid) REFERENCES public.appointment(patientid, appointmentid) ON DELETE CASCADE;


--
-- Name: prescription prescription_patientid_appointmentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_patientid_appointmentid_fkey FOREIGN KEY (patientid, appointmentid) REFERENCES public.appointment(patientid, appointmentid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

