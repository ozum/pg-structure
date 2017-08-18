--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.5
-- Dumped by pg_dump version 9.3.1
-- Started on 2014-11-26 13:07:00 EET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 7 (class 2615 OID 76408)
-- Name: extra_modules; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extra_modules;


--
-- TOC entry 195 (class 3079 OID 12018)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2487 (class 0 OID 0)
-- Dependencies: 195
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 196 (class 3079 OID 76409)
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA extra_modules;


--
-- TOC entry 2488 (class 0 OID 0)
-- Dependencies: 196
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


SET search_path = public, pg_catalog;

--
-- TOC entry 264 (class 1255 OID 76529)
-- Name: t_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION t_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS '

BEGIN

     NEW.updated_at := now();

     RETURN NEW;

END;

';


SET search_path = extra_modules, pg_catalog;

SET default_with_oids = false;

--
-- TOC entry 192 (class 1259 OID 79658)
-- Name: table1; Type: TABLE; Schema: extra_modules; Owner: -
--

CREATE TABLE table1 (
    id integer NOT NULL,
    name character varying(12),
    color_id integer
);


--
-- TOC entry 191 (class 1259 OID 79656)
-- Name: table1_id_seq; Type: SEQUENCE; Schema: extra_modules; Owner: -
--

CREATE SEQUENCE table1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2489 (class 0 OID 0)
-- Dependencies: 191
-- Name: table1_id_seq; Type: SEQUENCE OWNED BY; Schema: extra_modules; Owner: -
--

ALTER SEQUENCE table1_id_seq OWNED BY table1.id;


--
-- TOC entry 194 (class 1259 OID 79666)
-- Name: table2; Type: TABLE; Schema: extra_modules; Owner: -
--

CREATE TABLE table2 (
    id integer NOT NULL,
    color character varying(7),
    super_id integer
);


--
-- TOC entry 193 (class 1259 OID 79664)
-- Name: table2_id_seq; Type: SEQUENCE; Schema: extra_modules; Owner: -
--

CREATE SEQUENCE table2_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2490 (class 0 OID 0)
-- Dependencies: 193
-- Name: table2_id_seq; Type: SEQUENCE OWNED BY; Schema: extra_modules; Owner: -
--

ALTER SEQUENCE table2_id_seq OWNED BY table2.id;


SET search_path = public, pg_catalog;

--
-- TOC entry 174 (class 1259 OID 76552)
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE account (
    id integer NOT NULL,
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    owner_id integer,
    is_active boolean DEFAULT true NOT NULL,
    name character varying(50) DEFAULT 'Default test name'::character varying NOT NULL,
    field1 character varying(2)[],
    field2 numeric(3,2)[],
    field3 character(7)[],
    field4 timestamp(0) without time zone[],
    field5 bit(4)[],
    field6 bit varying(10)[],
    field7 timestamp(0) with time zone[],
    field8 time(6) without time zone[],
    field9 time(4) with time zone[],
    field10 smallint[],
    field11 integer[],
    field12 bigint[]
);


--
-- TOC entry 2491 (class 0 OID 0)
-- Dependencies: 174
-- Name: TABLE account; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE account IS 'Firma bilgilerinin tutulduğu tablo.';


--
-- TOC entry 2492 (class 0 OID 0)
-- Dependencies: 174
-- Name: COLUMN account.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account.id IS 'Kayıt no.';


--
-- TOC entry 2493 (class 0 OID 0)
-- Dependencies: 174
-- Name: COLUMN account.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account.created_at IS 'Kaydın oluşturulduğu zaman.';


--
-- TOC entry 2494 (class 0 OID 0)
-- Dependencies: 174
-- Name: COLUMN account.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account.updated_at IS 'Kaydın son güncellendiği zaman.';


--
-- TOC entry 2495 (class 0 OID 0)
-- Dependencies: 174
-- Name: COLUMN account.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account.owner_id IS 'Şirket sahibi.';


--
-- TOC entry 2496 (class 0 OID 0)
-- Dependencies: 174
-- Name: COLUMN account.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account.is_active IS 'Kayıt sistemde aktif olarak kullanılıyor mu. Silme işlemi olmadığından kalabalık yaratması istenmeyen kayıtlar pasif konuma getirilir.';


--
-- TOC entry 2497 (class 0 OID 0)
-- Dependencies: 174
-- Name: COLUMN account.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account.name IS 'Firma adı.';


--
-- TOC entry 173 (class 1259 OID 76550)
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2498 (class 0 OID 0)
-- Dependencies: 173
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE account_id_seq OWNED BY account.id;


--
-- TOC entry 176 (class 1259 OID 76568)
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE cart (
    id integer NOT NULL,
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    contact_id integer NOT NULL
);


--
-- TOC entry 2499 (class 0 OID 0)
-- Dependencies: 176
-- Name: TABLE cart; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE cart IS 'Alışveriş sepetlerini tutan tablo.';


--
-- TOC entry 2500 (class 0 OID 0)
-- Dependencies: 176
-- Name: COLUMN cart.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart.id IS 'Kayıt no.';


--
-- TOC entry 2501 (class 0 OID 0)
-- Dependencies: 176
-- Name: COLUMN cart.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart.created_at IS 'Kaydın oluşturulduğu zaman.';


--
-- TOC entry 2502 (class 0 OID 0)
-- Dependencies: 176
-- Name: COLUMN cart.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart.updated_at IS 'Kaydın son güncellendiği zaman.';


--
-- TOC entry 2503 (class 0 OID 0)
-- Dependencies: 176
-- Name: COLUMN cart.contact_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart.contact_id IS 'Alışveriş sepetinin sahibi.';


--
-- TOC entry 175 (class 1259 OID 76566)
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE cart_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2504 (class 0 OID 0)
-- Dependencies: 175
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE cart_id_seq OWNED BY cart.id;


--
-- TOC entry 179 (class 1259 OID 76590)
-- Name: cart_line_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE cart_line_item (
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    quantity smallint DEFAULT 1 NOT NULL
);


--
-- TOC entry 2505 (class 0 OID 0)
-- Dependencies: 179
-- Name: TABLE cart_line_item; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE cart_line_item IS 'Sepetteki ürünleri tutan tablo.';


--
-- TOC entry 2506 (class 0 OID 0)
-- Dependencies: 179
-- Name: COLUMN cart_line_item.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item.created_at IS 'Kaydın oluşturulduğu zaman.';


--
-- TOC entry 2507 (class 0 OID 0)
-- Dependencies: 179
-- Name: COLUMN cart_line_item.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item.updated_at IS 'Kaydın son güncellendiği zaman.';


--
-- TOC entry 2508 (class 0 OID 0)
-- Dependencies: 179
-- Name: COLUMN cart_line_item.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item.quantity IS 'Sepete eklenen ürün adedi.';


--
-- TOC entry 183 (class 1259 OID 76610)
-- Name: cart_line_item_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE cart_line_item_audit_log (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 2509 (class 0 OID 0)
-- Dependencies: 183
-- Name: TABLE cart_line_item_audit_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE cart_line_item_audit_log IS 'Sepete atılan ürünlerin loglarını tutan tablo. Multi primary keye ref veren tablonun test edilmesi için.';


--
-- TOC entry 2510 (class 0 OID 0)
-- Dependencies: 183
-- Name: COLUMN cart_line_item_audit_log.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_audit_log.id IS 'Kayıt no.';


--
-- TOC entry 2511 (class 0 OID 0)
-- Dependencies: 183
-- Name: COLUMN cart_line_item_audit_log.cart_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_audit_log.cart_id IS 'Sepet atılan ürünün sepet id''si.';


--
-- TOC entry 2512 (class 0 OID 0)
-- Dependencies: 183
-- Name: COLUMN cart_line_item_audit_log.product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_audit_log.product_id IS 'Sepet atılan ürünün ürün id''si.';


--
-- TOC entry 2513 (class 0 OID 0)
-- Dependencies: 183
-- Name: COLUMN cart_line_item_audit_log.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_audit_log.created_at IS 'Kaydın oluşturulduğu zaman.';


--
-- TOC entry 2514 (class 0 OID 0)
-- Dependencies: 183
-- Name: COLUMN cart_line_item_audit_log.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_audit_log.updated_at IS 'Kaydın son güncellendiği zaman.';


--
-- TOC entry 182 (class 1259 OID 76608)
-- Name: cart_line_item_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE cart_line_item_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2515 (class 0 OID 0)
-- Dependencies: 182
-- Name: cart_line_item_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE cart_line_item_audit_log_id_seq OWNED BY cart_line_item_audit_log.id;


--
-- TOC entry 185 (class 1259 OID 76622)
-- Name: cart_line_item_cross_composite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE cart_line_item_cross_composite (
    id integer NOT NULL,
    primary_cart_id integer,
    primary_product_id integer,
    secondary_cart_id integer,
    secondary_product_id integer
);


--
-- TOC entry 2516 (class 0 OID 0)
-- Dependencies: 185
-- Name: TABLE cart_line_item_cross_composite; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE cart_line_item_cross_composite IS 'Composite key içeren many to many tablo testi için oluşturulmuş olan tablo.';


--
-- TOC entry 2517 (class 0 OID 0)
-- Dependencies: 185
-- Name: COLUMN cart_line_item_cross_composite.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_cross_composite.id IS 'Kayıt no.';


--
-- TOC entry 2518 (class 0 OID 0)
-- Dependencies: 185
-- Name: COLUMN cart_line_item_cross_composite.primary_cart_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_cross_composite.primary_cart_id IS 'Birincil sepet id.';


--
-- TOC entry 2519 (class 0 OID 0)
-- Dependencies: 185
-- Name: COLUMN cart_line_item_cross_composite.primary_product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_cross_composite.primary_product_id IS 'Birincil ürün id.';


--
-- TOC entry 2520 (class 0 OID 0)
-- Dependencies: 185
-- Name: COLUMN cart_line_item_cross_composite.secondary_cart_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_cross_composite.secondary_cart_id IS 'İkincil sepet id.';


--
-- TOC entry 2521 (class 0 OID 0)
-- Dependencies: 185
-- Name: COLUMN cart_line_item_cross_composite.secondary_product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN cart_line_item_cross_composite.secondary_product_id IS 'İkincil ürün id.';


--
-- TOC entry 184 (class 1259 OID 76620)
-- Name: cart_line_item_cross_composite_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE cart_line_item_cross_composite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2522 (class 0 OID 0)
-- Dependencies: 184
-- Name: cart_line_item_cross_composite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE cart_line_item_cross_composite_id_seq OWNED BY cart_line_item_cross_composite.id;


--
-- TOC entry 187 (class 1259 OID 76635)
-- Name: class; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE class (
    name character varying(20) NOT NULL,
    teacher_name character varying(20) NOT NULL,
    teacher_surname character varying(20) NOT NULL,
    is_popular boolean
);


--
-- TOC entry 2523 (class 0 OID 0)
-- Dependencies: 187
-- Name: TABLE class; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE class IS '3''lü composite key test etmek için oluşturulmuş yapay ikinci tablo.';


--
-- TOC entry 2524 (class 0 OID 0)
-- Dependencies: 187
-- Name: COLUMN class.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN class.name IS 'Ders ismi';


--
-- TOC entry 2525 (class 0 OID 0)
-- Dependencies: 187
-- Name: COLUMN class.teacher_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN class.teacher_name IS 'Dersi veren hocanın ismi';


--
-- TOC entry 2526 (class 0 OID 0)
-- Dependencies: 187
-- Name: COLUMN class.teacher_surname; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN class.teacher_surname IS 'Dersi veren hocanın soy ismi';


--
-- TOC entry 2527 (class 0 OID 0)
-- Dependencies: 187
-- Name: COLUMN class.is_popular; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN class.is_popular IS 'Popüler ders mi?';


--
-- TOC entry 188 (class 1259 OID 76640)
-- Name: class_register; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE class_register (
    name character varying(20) NOT NULL,
    teacher_name character varying(20) NOT NULL,
    teacher_surname character varying(20) NOT NULL,
    first_name character varying(20) NOT NULL,
    middle_name character varying(20) NOT NULL,
    last_name character varying(20) NOT NULL
);


--
-- TOC entry 2528 (class 0 OID 0)
-- Dependencies: 188
-- Name: TABLE class_register; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE class_register IS '3 lü komposit key ile birleşen many to many tabloları test etmek için yapay tablo.';


--
-- TOC entry 172 (class 1259 OID 76532)
-- Name: contact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE contact (
    id integer NOT NULL,
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    name character varying(20) NOT NULL,
    surname character varying(20) NOT NULL,
    email character varying(20) NOT NULL,
    birth_date date NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    company_id integer NOT NULL,
    second_company_id integer,
    custom json,
    custom_hstore extra_modules.hstore
);


--
-- TOC entry 2529 (class 0 OID 0)
-- Dependencies: 172
-- Name: TABLE contact; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE contact IS 'Kişi bilgilerini tutan tablo.';


--
-- TOC entry 2530 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.id IS 'Kayıt no.';


--
-- TOC entry 2531 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.created_at IS 'Kaydın oluşturulduğu zaman.';


--
-- TOC entry 2532 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.updated_at IS 'Kaydın son güncellendiği zaman.';


--
-- TOC entry 2533 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.name IS 'Kullanıcının adı.';


--
-- TOC entry 2534 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.surname; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.surname IS 'Kullanıcının soyadı.';


--
-- TOC entry 2535 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.email IS 'Kullanıcının e-posta adresi.';


--
-- TOC entry 2536 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.birth_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.birth_date IS 'Doğum tarihi.';


--
-- TOC entry 2537 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.is_active IS 'Kayıt sistemde aktif olarak kullanılıyor mu. Silme işlemi olmadığından kalabalık yaratması istenmeyen kayıtlar pasif konuma getirilir.';


--
-- TOC entry 2538 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.company_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.company_id IS 'İrtibatın dahil olduğu firma.';


--
-- TOC entry 2539 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.second_company_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.second_company_id IS 'İrtibatın ikinci şirketi. (Aynı tablodan aynı tabloya birden fazla relation varsa test etmek için)';


--
-- TOC entry 2540 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.custom; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.custom IS 'JSON formatında custom değerleri tutan alan.';


--
-- TOC entry 2541 (class 0 OID 0)
-- Dependencies: 172
-- Name: COLUMN contact.custom_hstore; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN contact.custom_hstore IS 'HSTORE formatında custom değerleri tutan alan';


--
-- TOC entry 171 (class 1259 OID 76530)
-- Name: contact_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE contact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2542 (class 0 OID 0)
-- Dependencies: 171
-- Name: contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE contact_id_seq OWNED BY contact.id;


--
-- TOC entry 190 (class 1259 OID 76647)
-- Name: message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE message (
    id integer NOT NULL,
    sender_first_name character varying(20),
    sender_middle_name character varying(20),
    sender_last_name character varying(20),
    receiver_first_name character varying(20),
    receiver_middle_name character varying(20),
    receiver_last_name character varying(20)
);


--
-- TOC entry 2543 (class 0 OID 0)
-- Dependencies: 190
-- Name: TABLE message; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE message IS '3''lü composite key içeren self referencing tabloları test etmek için yapay tablo.';


--
-- TOC entry 2544 (class 0 OID 0)
-- Dependencies: 190
-- Name: COLUMN message.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN message.id IS 'Kayıt no';


--
-- TOC entry 2545 (class 0 OID 0)
-- Dependencies: 190
-- Name: COLUMN message.sender_first_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN message.sender_first_name IS 'Gönderen ilk ismi';


--
-- TOC entry 2546 (class 0 OID 0)
-- Dependencies: 190
-- Name: COLUMN message.sender_middle_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN message.sender_middle_name IS 'Gönderen orta ismi';


--
-- TOC entry 2547 (class 0 OID 0)
-- Dependencies: 190
-- Name: COLUMN message.sender_last_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN message.sender_last_name IS 'Gönderen soy ismi';


--
-- TOC entry 2548 (class 0 OID 0)
-- Dependencies: 190
-- Name: COLUMN message.receiver_first_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN message.receiver_first_name IS 'Mesaj alanın ilk ismi';


--
-- TOC entry 2549 (class 0 OID 0)
-- Dependencies: 190
-- Name: COLUMN message.receiver_middle_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN message.receiver_middle_name IS 'Mesaj alanın orta ismi.';


--
-- TOC entry 2550 (class 0 OID 0)
-- Dependencies: 190
-- Name: COLUMN message.receiver_last_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN message.receiver_last_name IS 'Mesaj alanın soy ismi.';


--
-- TOC entry 189 (class 1259 OID 76645)
-- Name: message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2551 (class 0 OID 0)
-- Dependencies: 189
-- Name: message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE message_id_seq OWNED BY message.id;


--
-- TOC entry 178 (class 1259 OID 76580)
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE product (
    id integer NOT NULL,
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    name character varying(20) NOT NULL,
    product_category_id integer NOT NULL
);


--
-- TOC entry 2552 (class 0 OID 0)
-- Dependencies: 178
-- Name: TABLE product; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE product IS 'Ürünleri tutan tablo.';


--
-- TOC entry 2553 (class 0 OID 0)
-- Dependencies: 178
-- Name: COLUMN product.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN product.id IS 'Kayıt no.';


--
-- TOC entry 2554 (class 0 OID 0)
-- Dependencies: 178
-- Name: COLUMN product.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN product.created_at IS 'Kaydın oluşturulduğu zaman.';


--
-- TOC entry 2555 (class 0 OID 0)
-- Dependencies: 178
-- Name: COLUMN product.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN product.updated_at IS 'Kaydın son güncellendiği zaman.';


--
-- TOC entry 2556 (class 0 OID 0)
-- Dependencies: 178
-- Name: COLUMN product.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN product.name IS 'Ürünün ismi';


--
-- TOC entry 2557 (class 0 OID 0)
-- Dependencies: 178
-- Name: COLUMN product.product_category_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN product.product_category_id IS 'Ürün kategorisi';


--
-- TOC entry 181 (class 1259 OID 76601)
-- Name: product_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE product_category (
    id integer NOT NULL,
    parent_category_id integer,
    name character varying(20) NOT NULL
);


--
-- TOC entry 2558 (class 0 OID 0)
-- Dependencies: 181
-- Name: TABLE product_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE product_category IS 'Ürün kategorilerini tutan tablo.';


--
-- TOC entry 2559 (class 0 OID 0)
-- Dependencies: 181
-- Name: COLUMN product_category.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN product_category.id IS 'Kayıt no.';


--
-- TOC entry 2560 (class 0 OID 0)
-- Dependencies: 181
-- Name: COLUMN product_category.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN product_category.name IS 'Ürün kategori ismi.';


--
-- TOC entry 180 (class 1259 OID 76599)
-- Name: product_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE product_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2561 (class 0 OID 0)
-- Dependencies: 180
-- Name: product_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE product_category_id_seq OWNED BY product_category.id;


--
-- TOC entry 177 (class 1259 OID 76578)
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2562 (class 0 OID 0)
-- Dependencies: 177
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE product_id_seq OWNED BY product.id;


--
-- TOC entry 186 (class 1259 OID 76630)
-- Name: student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE student (
    first_name character varying(20) NOT NULL,
    middle_name character varying(20) NOT NULL,
    last_name character varying(20) NOT NULL,
    class smallint
);


--
-- TOC entry 2563 (class 0 OID 0)
-- Dependencies: 186
-- Name: TABLE student; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE student IS '3''lü composit key test için oluşturulmuş yapay tablo.';


--
-- TOC entry 2564 (class 0 OID 0)
-- Dependencies: 186
-- Name: COLUMN student.first_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN student.first_name IS 'Adı.';


--
-- TOC entry 2565 (class 0 OID 0)
-- Dependencies: 186
-- Name: COLUMN student.middle_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN student.middle_name IS 'Orta ismi';


--
-- TOC entry 2566 (class 0 OID 0)
-- Dependencies: 186
-- Name: COLUMN student.last_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN student.last_name IS 'Soy ismi';


SET search_path = extra_modules, pg_catalog;

--
-- TOC entry 2283 (class 2604 OID 79661)
-- Name: id; Type: DEFAULT; Schema: extra_modules; Owner: -
--

ALTER TABLE ONLY table1 ALTER COLUMN id SET DEFAULT nextval('table1_id_seq'::regclass);


--
-- TOC entry 2284 (class 2604 OID 79669)
-- Name: id; Type: DEFAULT; Schema: extra_modules; Owner: -
--

ALTER TABLE ONLY table2 ALTER COLUMN id SET DEFAULT nextval('table2_id_seq'::regclass);


SET search_path = public, pg_catalog;

--
-- TOC entry 2263 (class 2604 OID 76555)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY account ALTER COLUMN id SET DEFAULT nextval('account_id_seq'::regclass);


--
-- TOC entry 2268 (class 2604 OID 76571)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart ALTER COLUMN id SET DEFAULT nextval('cart_id_seq'::regclass);


--
-- TOC entry 2278 (class 2604 OID 76613)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item_audit_log ALTER COLUMN id SET DEFAULT nextval('cart_line_item_audit_log_id_seq'::regclass);


--
-- TOC entry 2281 (class 2604 OID 76625)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item_cross_composite ALTER COLUMN id SET DEFAULT nextval('cart_line_item_cross_composite_id_seq'::regclass);


--
-- TOC entry 2259 (class 2604 OID 76535)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY contact ALTER COLUMN id SET DEFAULT nextval('contact_id_seq'::regclass);


--
-- TOC entry 2282 (class 2604 OID 76650)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY message ALTER COLUMN id SET DEFAULT nextval('message_id_seq'::regclass);


--
-- TOC entry 2271 (class 2604 OID 76583)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY product ALTER COLUMN id SET DEFAULT nextval('product_id_seq'::regclass);


--
-- TOC entry 2277 (class 2604 OID 76604)
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_category ALTER COLUMN id SET DEFAULT nextval('product_category_id_seq'::regclass);


SET search_path = extra_modules, pg_catalog;

--
-- TOC entry 2478 (class 0 OID 79658)
-- Dependencies: 192
-- Data for Name: table1; Type: TABLE DATA; Schema: extra_modules; Owner: -
--



--
-- TOC entry 2567 (class 0 OID 0)
-- Dependencies: 191
-- Name: table1_id_seq; Type: SEQUENCE SET; Schema: extra_modules; Owner: -
--

SELECT pg_catalog.setval('table1_id_seq', 1, false);


--
-- TOC entry 2480 (class 0 OID 79666)
-- Dependencies: 194
-- Data for Name: table2; Type: TABLE DATA; Schema: extra_modules; Owner: -
--



--
-- TOC entry 2568 (class 0 OID 0)
-- Dependencies: 193
-- Name: table2_id_seq; Type: SEQUENCE SET; Schema: extra_modules; Owner: -
--

SELECT pg_catalog.setval('table2_id_seq', 1, false);


SET search_path = public, pg_catalog;

--
-- TOC entry 2460 (class 0 OID 76552)
-- Dependencies: 174
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO account (id, created_at, updated_at, owner_id, is_active, name, field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12) VALUES (1, '2014-11-05 00:57:33', '2014-11-05 00:57:33', NULL, true, 'Ozsoft', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO account (id, created_at, updated_at, owner_id, is_active, name, field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12) VALUES (2, '2014-11-05 00:57:33', '2014-11-05 00:57:33', NULL, true, 'FPS Production', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO account (id, created_at, updated_at, owner_id, is_active, name, field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12) VALUES (3, '2014-11-05 00:57:33', '2014-11-05 00:57:33', NULL, true, 'Microsoft', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO account (id, created_at, updated_at, owner_id, is_active, name, field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12) VALUES (4, '2014-11-05 00:57:33', '2014-11-05 00:57:33', NULL, true, 'Acme', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- TOC entry 2569 (class 0 OID 0)
-- Dependencies: 173
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('account_id_seq', 4, true);


--
-- TOC entry 2462 (class 0 OID 76568)
-- Dependencies: 176
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO cart (id, created_at, updated_at, contact_id) VALUES (1, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 1);
INSERT INTO cart (id, created_at, updated_at, contact_id) VALUES (2, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 4);
INSERT INTO cart (id, created_at, updated_at, contact_id) VALUES (3, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 3);
INSERT INTO cart (id, created_at, updated_at, contact_id) VALUES (4, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 2);
INSERT INTO cart (id, created_at, updated_at, contact_id) VALUES (5, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 1);


--
-- TOC entry 2570 (class 0 OID 0)
-- Dependencies: 175
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('cart_id_seq', 5, true);


--
-- TOC entry 2465 (class 0 OID 76590)
-- Dependencies: 179
-- Data for Name: cart_line_item; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (4, 3, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 3);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (4, 1, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 1);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (3, 3, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 1);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (3, 5, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 2);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (2, 4, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 1);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (2, 1, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 1);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (1, 3, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 1);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (1, 2, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 3);
INSERT INTO cart_line_item (cart_id, product_id, created_at, updated_at, quantity) VALUES (1, 1, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 2);


--
-- TOC entry 2469 (class 0 OID 76610)
-- Dependencies: 183
-- Data for Name: cart_line_item_audit_log; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 2571 (class 0 OID 0)
-- Dependencies: 182
-- Name: cart_line_item_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('cart_line_item_audit_log_id_seq', 1, false);


--
-- TOC entry 2471 (class 0 OID 76622)
-- Dependencies: 185
-- Data for Name: cart_line_item_cross_composite; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 2572 (class 0 OID 0)
-- Dependencies: 184
-- Name: cart_line_item_cross_composite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('cart_line_item_cross_composite_id_seq', 1, false);


--
-- TOC entry 2473 (class 0 OID 76635)
-- Dependencies: 187
-- Data for Name: class; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 2474 (class 0 OID 76640)
-- Dependencies: 188
-- Data for Name: class_register; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 2458 (class 0 OID 76532)
-- Dependencies: 172
-- Data for Name: contact; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO contact (id, created_at, updated_at, name, surname, email, birth_date, is_active, company_id, second_company_id, custom, custom_hstore) VALUES (1, '2014-11-05 00:57:33', '2014-11-05 00:57:33', 'Özüm', 'Eldoğan', 'ozum@ozum.net ', '1980-01-02', true, 1, NULL, '{"team":"BJK", "city":"Istanbul"}', '"city"=>"''Istanbul''", "team"=>"''BJK''"');
INSERT INTO contact (id, created_at, updated_at, name, surname, email, birth_date, is_active, company_id, second_company_id, custom, custom_hstore) VALUES (2, '2014-11-05 00:57:33', '2014-11-05 00:57:33', 'Alihan', 'Karagül', 'a@fpsproduction.com', '2978-01-01', true, 2, NULL, '{"team":"FB", "city":"Istanbul"}', '"city"=>"''Istanbul''", "team"=>"''FB''"');
INSERT INTO contact (id, created_at, updated_at, name, surname, email, birth_date, is_active, company_id, second_company_id, custom, custom_hstore) VALUES (3, '2014-11-05 00:57:33', '2014-11-05 00:57:33', 'Kemal', 'Saraç', 'kemal@ozsoft.com', '1978-03-04', true, 2, NULL, '{"team":"FB", "city":"Istanbul"}', '"city"=>"''Istanbul''", "team"=>"''BJK''"');
INSERT INTO contact (id, created_at, updated_at, name, surname, email, birth_date, is_active, company_id, second_company_id, custom, custom_hstore) VALUES (4, '2014-11-05 00:57:33', '2014-11-05 00:57:33', 'Ufuk', 'Yurtsever', 'ufuk@ozsoft.com', '0150-01-01', true, 2, NULL, '{"team":"FB", "city":"Istanbul"}', '"city"=>"''Istanbul''", "team"=>"''FB''"');


--
-- TOC entry 2573 (class 0 OID 0)
-- Dependencies: 171
-- Name: contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('contact_id_seq', 4, true);


--
-- TOC entry 2476 (class 0 OID 76647)
-- Dependencies: 190
-- Data for Name: message; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 2574 (class 0 OID 0)
-- Dependencies: 189
-- Name: message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('message_id_seq', 1, false);


--
-- TOC entry 2464 (class 0 OID 76580)
-- Dependencies: 178
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO product (id, created_at, updated_at, name, product_category_id) VALUES (1, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 'Sony Z2', 3);
INSERT INTO product (id, created_at, updated_at, name, product_category_id) VALUES (2, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 'Logitech T-14', 5);
INSERT INTO product (id, created_at, updated_at, name, product_category_id) VALUES (3, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 'Çikolata', 6);
INSERT INTO product (id, created_at, updated_at, name, product_category_id) VALUES (4, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 'Pergel', 7);
INSERT INTO product (id, created_at, updated_at, name, product_category_id) VALUES (5, '2014-11-05 00:57:34', '2014-11-05 00:57:34', 'Kalem', 7);


--
-- TOC entry 2467 (class 0 OID 76601)
-- Dependencies: 181
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO product_category (id, parent_category_id, name) VALUES (1, NULL, 'Elektronik');
INSERT INTO product_category (id, parent_category_id, name) VALUES (2, 1, 'Telekom');
INSERT INTO product_category (id, parent_category_id, name) VALUES (3, 2, 'Telefon');
INSERT INTO product_category (id, parent_category_id, name) VALUES (4, 1, 'Bilgisayar');
INSERT INTO product_category (id, parent_category_id, name) VALUES (5, 4, 'Mouse');
INSERT INTO product_category (id, parent_category_id, name) VALUES (6, NULL, 'Diğer');
INSERT INTO product_category (id, parent_category_id, name) VALUES (7, NULL, 'Kırtasiye');


--
-- TOC entry 2575 (class 0 OID 0)
-- Dependencies: 180
-- Name: product_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('product_category_id_seq', 7, true);


--
-- TOC entry 2576 (class 0 OID 0)
-- Dependencies: 177
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('product_id_seq', 5, true);


--
-- TOC entry 2472 (class 0 OID 76630)
-- Dependencies: 186
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: -
--



SET search_path = extra_modules, pg_catalog;

--
-- TOC entry 2324 (class 2606 OID 79663)
-- Name: table1_pkey; Type: CONSTRAINT; Schema: extra_modules; Owner: -
--

ALTER TABLE ONLY table1
    ADD CONSTRAINT table1_pkey PRIMARY KEY (id);


--
-- TOC entry 2326 (class 2606 OID 79671)
-- Name: table2_pkey; Type: CONSTRAINT; Schema: extra_modules; Owner: -
--

ALTER TABLE ONLY table2
    ADD CONSTRAINT table2_pkey PRIMARY KEY (id);


SET search_path = public, pg_catalog;

--
-- TOC entry 2289 (class 2606 OID 76546)
-- Name: Key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY contact
    ADD CONSTRAINT "Key1" PRIMARY KEY (id);


--
-- TOC entry 2316 (class 2606 OID 76639)
-- Name: Key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY class
    ADD CONSTRAINT "Key10" PRIMARY KEY (name, teacher_name, teacher_surname);


--
-- TOC entry 2318 (class 2606 OID 76644)
-- Name: Key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY class_register
    ADD CONSTRAINT "Key11" PRIMARY KEY (name, teacher_name, teacher_surname, first_name, middle_name, last_name);


--
-- TOC entry 2322 (class 2606 OID 76654)
-- Name: Key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY message
    ADD CONSTRAINT "Key12" PRIMARY KEY (id);


--
-- TOC entry 2294 (class 2606 OID 76564)
-- Name: Key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY account
    ADD CONSTRAINT "Key2" PRIMARY KEY (id);


--
-- TOC entry 2297 (class 2606 OID 76576)
-- Name: Key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart
    ADD CONSTRAINT "Key3" PRIMARY KEY (id);


--
-- TOC entry 2300 (class 2606 OID 76588)
-- Name: Key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY product
    ADD CONSTRAINT "Key4" PRIMARY KEY (id);


--
-- TOC entry 2302 (class 2606 OID 76597)
-- Name: Key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item
    ADD CONSTRAINT "Key5" PRIMARY KEY (cart_id, product_id);


--
-- TOC entry 2305 (class 2606 OID 76607)
-- Name: Key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_category
    ADD CONSTRAINT "Key6" PRIMARY KEY (id);


--
-- TOC entry 2308 (class 2606 OID 76618)
-- Name: Key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item_audit_log
    ADD CONSTRAINT "Key7" PRIMARY KEY (id);


--
-- TOC entry 2312 (class 2606 OID 76629)
-- Name: Key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item_cross_composite
    ADD CONSTRAINT "Key8" PRIMARY KEY (id);


--
-- TOC entry 2314 (class 2606 OID 76634)
-- Name: Key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY student
    ADD CONSTRAINT "Key9" PRIMARY KEY (first_name, middle_name, last_name);


--
-- TOC entry 2291 (class 2606 OID 76548)
-- Name: email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY contact
    ADD CONSTRAINT email UNIQUE (email);


--
-- TOC entry 2285 (class 1259 OID 76542)
-- Name: IX_Relationship1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship1" ON contact USING btree (company_id);


--
-- TOC entry 2319 (class 1259 OID 76651)
-- Name: IX_Relationship11; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship11" ON message USING btree (sender_first_name, sender_middle_name, sender_last_name);


--
-- TOC entry 2320 (class 1259 OID 76652)
-- Name: IX_Relationship12; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship12" ON message USING btree (receiver_first_name, receiver_middle_name, receiver_last_name);


--
-- TOC entry 2295 (class 1259 OID 76574)
-- Name: IX_Relationship2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship2" ON cart USING btree (contact_id);


--
-- TOC entry 2303 (class 1259 OID 76605)
-- Name: IX_Relationship3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship3" ON product_category USING btree (parent_category_id);


--
-- TOC entry 2298 (class 1259 OID 76586)
-- Name: IX_Relationship4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship4" ON product USING btree (product_category_id);


--
-- TOC entry 2306 (class 1259 OID 76616)
-- Name: IX_Relationship5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship5" ON cart_line_item_audit_log USING btree (cart_id, product_id);


--
-- TOC entry 2286 (class 1259 OID 76543)
-- Name: IX_Relationship6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship6" ON contact USING btree (second_company_id);


--
-- TOC entry 2292 (class 1259 OID 76562)
-- Name: IX_Relationship7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship7" ON account USING btree (owner_id);


--
-- TOC entry 2309 (class 1259 OID 76626)
-- Name: IX_Relationship8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship8" ON cart_line_item_cross_composite USING btree (primary_cart_id, primary_product_id);


--
-- TOC entry 2310 (class 1259 OID 76627)
-- Name: IX_Relationship9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Relationship9" ON cart_line_item_cross_composite USING btree (secondary_cart_id, secondary_product_id);


--
-- TOC entry 2287 (class 1259 OID 76544)
-- Name: IX_Unique_Full_Name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_Unique_Full_Name" ON contact USING btree (name, surname);


--
-- TOC entry 2344 (class 2620 OID 76549)
-- Name: updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER updated_at BEFORE UPDATE ON contact FOR EACH ROW EXECUTE PROCEDURE t_updated_at();


--
-- TOC entry 2345 (class 2620 OID 76565)
-- Name: updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER updated_at BEFORE UPDATE ON account FOR EACH ROW EXECUTE PROCEDURE t_updated_at();


--
-- TOC entry 2346 (class 2620 OID 76577)
-- Name: updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE PROCEDURE t_updated_at();


--
-- TOC entry 2347 (class 2620 OID 76589)
-- Name: updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER updated_at BEFORE UPDATE ON product FOR EACH ROW EXECUTE PROCEDURE t_updated_at();


--
-- TOC entry 2348 (class 2620 OID 76598)
-- Name: updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER updated_at BEFORE UPDATE ON cart_line_item FOR EACH ROW EXECUTE PROCEDURE t_updated_at();


--
-- TOC entry 2349 (class 2620 OID 76619)
-- Name: updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER updated_at BEFORE UPDATE ON cart_line_item_audit_log FOR EACH ROW EXECUTE PROCEDURE t_updated_at();


SET search_path = extra_modules, pg_catalog;

--
-- TOC entry 2342 (class 2606 OID 79672)
-- Name: table1_fk; Type: FK CONSTRAINT; Schema: extra_modules; Owner: -
--

ALTER TABLE ONLY table1
    ADD CONSTRAINT table1_fk FOREIGN KEY (color_id) REFERENCES table1(id);


--
-- TOC entry 2343 (class 2606 OID 79677)
-- Name: table2_fk; Type: FK CONSTRAINT; Schema: extra_modules; Owner: -
--

ALTER TABLE ONLY table2
    ADD CONSTRAINT table2_fk FOREIGN KEY (super_id) REFERENCES public.account(id);


SET search_path = public, pg_catalog;

--
-- TOC entry 2331 (class 2606 OID 76680)
-- Name: Relationship4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY product
    ADD CONSTRAINT "Relationship4" FOREIGN KEY (product_category_id) REFERENCES product_category(id);


--
-- TOC entry 2327 (class 2606 OID 76655)
-- Name: account_has_contacts; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY contact
    ADD CONSTRAINT account_has_contacts FOREIGN KEY (company_id) REFERENCES account(id);


--
-- TOC entry 2328 (class 2606 OID 76685)
-- Name: account_has_second_contacts; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY contact
    ADD CONSTRAINT account_has_second_contacts FOREIGN KEY (second_company_id) REFERENCES account(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 2332 (class 2606 OID 76665)
-- Name: cart_has_products; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item
    ADD CONSTRAINT cart_has_products FOREIGN KEY (cart_id) REFERENCES cart(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 2335 (class 2606 OID 76695)
-- Name: cart_line_item_has_audit_logs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item_audit_log
    ADD CONSTRAINT cart_line_item_has_audit_logs FOREIGN KEY (cart_id, product_id) REFERENCES cart_line_item(cart_id, product_id);


--
-- TOC entry 2336 (class 2606 OID 76700)
-- Name: cart_line_item_has_many_primary_cross; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item_cross_composite
    ADD CONSTRAINT cart_line_item_has_many_primary_cross FOREIGN KEY (primary_cart_id, primary_product_id) REFERENCES cart_line_item(cart_id, product_id);


--
-- TOC entry 2337 (class 2606 OID 76705)
-- Name: cart_line_item_has_many_secondary_cross; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item_cross_composite
    ADD CONSTRAINT cart_line_item_has_many_secondary_cross FOREIGN KEY (secondary_cart_id, secondary_product_id) REFERENCES cart_line_item(cart_id, product_id);


--
-- TOC entry 2338 (class 2606 OID 76710)
-- Name: class_has_many_students; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY class_register
    ADD CONSTRAINT class_has_many_students FOREIGN KEY (name, teacher_name, teacher_surname) REFERENCES class(name, teacher_name, teacher_surname) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 2330 (class 2606 OID 76660)
-- Name: contact_has_carts; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart
    ADD CONSTRAINT contact_has_carts FOREIGN KEY (contact_id) REFERENCES contact(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2329 (class 2606 OID 76690)
-- Name: contact_has_companies; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY account
    ADD CONSTRAINT contact_has_companies FOREIGN KEY (owner_id) REFERENCES contact(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 2334 (class 2606 OID 76675)
-- Name: product_category_has_parent_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_category
    ADD CONSTRAINT product_category_has_parent_category FOREIGN KEY (parent_category_id) REFERENCES product_category(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 2333 (class 2606 OID 76670)
-- Name: product_has_carts; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cart_line_item
    ADD CONSTRAINT product_has_carts FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 2339 (class 2606 OID 76715)
-- Name: student_has_many_classes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY class_register
    ADD CONSTRAINT student_has_many_classes FOREIGN KEY (first_name, middle_name, last_name) REFERENCES student(first_name, middle_name, last_name) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 2341 (class 2606 OID 76725)
-- Name: student_has_many_messages_received; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY message
    ADD CONSTRAINT student_has_many_messages_received FOREIGN KEY (receiver_first_name, receiver_middle_name, receiver_last_name) REFERENCES student(first_name, middle_name, last_name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2340 (class 2606 OID 76720)
-- Name: student_has_many_messages_sent; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY message
    ADD CONSTRAINT student_has_many_messages_sent FOREIGN KEY (sender_first_name, sender_middle_name, sender_last_name) REFERENCES student(first_name, middle_name, last_name) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2014-11-26 13:07:00 EET

--
-- PostgreSQL database dump complete
--

