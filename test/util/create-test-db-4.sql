-- SQL Manager for PostgreSQL 5.8.0.48236
-- ---------------------------------------
-- Host      : 192.168.1.72
-- Database  : deneme
-- Version   : PostgreSQL 9.6.1 on x86_64-apple-darwin14.5.0, compiled by Apple LLVM version 7.0.0 (clang-700.1.76), 64-bit



CREATE SCHEMA nir;
SET check_function_bodies = false;
--
-- Definition for type atrtype (OID = 218566) :
--
SET search_path = nir, pg_catalog;
CREATE TYPE nir.atrtype AS (
  atype integer,
  aname text,
  avalue text
);
--
-- Definition for type change_rights_type (OID = 218569) :
--
CREATE TYPE nir.change_rights_type AS (
  n_parent integer,
  parent_id integer,
  parent_name text,
  parent_type integer,
  o_id integer,
  o_name text,
  o_id_type integer
);
--
-- Definition for type modulerole (OID = 218572) :
--
CREATE TYPE nir.modulerole AS (
  module_role_id integer,
  module_role_mask varchar,
  module_id integer,
  role_id integer
);
--
-- Definition for type rightss_of_access (OID = 218575) :
--
CREATE TYPE nir.rightss_of_access AS (
  idobject integer,
  idsubject text,
  mask varchar
);
--
-- Definition for type rightsss_of_access (OID = 218578) :
--
CREATE TYPE nir.rightsss_of_access AS (
  idobject integer,
  idsubject integer,
  mask bit varying
);
--
-- Definition for type usertype (OID = 218581) :
--
CREATE TYPE nir.usertype AS (
  id_user integer,
  login_user varchar,
  pass_user varchar,
  user_info varchar,
  user_id_system varchar
);
--
-- Definition for function add_alert (OID = 218582) :
--
CREATE FUNCTION nir.add_alert (
  namess character varying,
  sql text
)
RETURNS integer
AS
$body$
DECLARE
	id integer;
	id_link integer;
BEGIN
	if exists(select o_id, o_name  from nir.all_templates_view where o_id_type=16 and o_name = namess and user_id_system=current_user) then
		return -1;
	else
		insert into nir.Nir_object (o_name,o_id_type) values (namess,16) returning o_id into id;
-- Добавить связть на самаго себя для указания SQL
		if( id is not null) then
			INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
				VALUES (id, id, 11, cast(2 as smallint)) returning l_id into id_link;
			INSERT INTO nir.Nir_object_value_varchar(ovv_value, ovv_link_id)
				VALUES ( sql, id_link);
			perform nir.set_owner( id );
		end if;
		return id;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_atrs_to_obj (OID = 218583) :
--
CREATE FUNCTION nir.add_atrs_to_obj (
  iddoc integer,
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$
DECLARE cnt integer;
	i integer;
	attr nir.atrtype;
	--aname text;
	--val text;
	--typ smallint;
begin
	cnt=0;
	if( array_length(atr,1)>0 ) then
	FOR i IN 1..array_length(atr,1)
	--FOR attr IN SELECT tab.val FROM UNNEST(atr) as tab(val)
	LOOP
		attr := atr[i];
		case
		when attr.atype=1 then perform nir.add_attr_to_obj_int(cast(attr.aname as character varying), cast(attr.avalue as integer), idDoc);
		when attr.atype=2 then perform nir.add_attr_to_obj_varchar(attr.aname, attr.avalue, idDoc);
		when attr.atype=3 then perform nir.add_attr_to_obj_datetime(attr.aname, cast(attr.avalue as timestamp), idDoc);
		end case;
		cnt = cnt+1;
	END LOOP;
	end if;
	return cnt;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_doc_date (OID = 218584) :
--
CREATE FUNCTION nir.add_attr_to_doc_date (
  name character varying,
  value date,
  doc_id integer
)
RETURNS integer
AS
$body$
BEGIN
	return nir.add_attr_to_obj_datetime(name,cast(value to timestamp without time zone),doc_id);
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_doc_int (OID = 218585) :
--
CREATE FUNCTION nir.add_attr_to_doc_int (
  name character varying,
  value integer,
  doc_id integer
)
RETURNS integer
AS
$body$
BEGIN
	return nir.add_attr_to_obj_int(name,value,doc_id);
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_doc_varchar (OID = 218586) :
--
CREATE FUNCTION nir.add_attr_to_doc_varchar (
  name character varying,
  value character varying,
  doc_id integer
)
RETURNS integer
AS
$body$
BEGIN
	return nir.add_attr_to_obj_varchar(name,value,doc_id);
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_obj_datetime (OID = 218587) :
--
CREATE FUNCTION nir.add_attr_to_obj_datetime (
  namess character varying,
  valuess timestamp without time zone,
  obj_id integer
)
RETURNS integer
AS
$body$
DECLARE
	id_attr integer;
	id_link integer;
	id_val integer;
BEGIN
	--проверка, нет ли атрибута с таким же именем у документа
	id_attr := nir.addattr(namess,cast(3 as smallint));
	if not exists( SELECT l_id FROM nir.Nir_links WHERE l_id1=obj_id
			AND l_id2=id_attr AND l_id_link_type=5) then
		INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
			VALUES (obj_id, id_attr, 5, 3) returning l_id into id_link;
	else
		id_link := (SELECT l_id FROM nir.Nir_links WHERE l_id1=obj_id
			AND l_id2=id_attr AND l_id_link_type=5 limit 1);
	end if;
	id_val := COALESCE( (SELECT ovd_id FROM nir.Nir_object_value_datetime
			WHERE ovd_link_id=id_link limit 1),0);
  	if id_val>0 then
		UPDATE nir.Nir_object_value_datetime
			SET ovd_value=valuess WHERE ovd_id=id_val;

	else
  		INSERT INTO nir.Nir_object_value_datetime(ovd_value, ovd_link_id)
			VALUES ( valuess, id_link) returning ovd_id into id_val;
	end if;
	return id_val;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_obj_int (OID = 218588) :
--
CREATE FUNCTION nir.add_attr_to_obj_int (
  namess character varying,
  valuess integer,
  obj_id integer
)
RETURNS integer
AS
$body$
DECLARE
	id_attr integer;
	id_link integer;
	id_val integer;
BEGIN
	--проверка, нет ли атрибута с таким же именем у документа
	id_attr := nir.addattr(namess,cast(1 as smallint));
	if not exists( SELECT l_id FROM nir.Nir_links WHERE l_id1=obj_id
			AND l_id2=id_attr AND l_id_link_type=5) then
		INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
			VALUES (obj_id, id_attr, 5, 1) returning l_id into id_link;
	else
		id_link := (SELECT l_id FROM nir.Nir_links WHERE l_id1=obj_id
			AND l_id2=id_attr AND l_id_link_type=5 limit 1);
	end if;
	id_val := COALESCE( (SELECT obi_id FROM nir.Nir_object_value_int
			WHERE obi_link_id=id_link limit 1),0);
  	if id_val>0 then
		UPDATE nir.Nir_object_value_int
			SET obi_value=valuess WHERE obi_id=id_val;

	else
  		INSERT INTO nir.Nir_object_value_int(obi_value, obi_link_id)
			VALUES ( valuess, id_link) returning obi_id into id_val;
	end if;
	return id_val;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_obj_varchar (OID = 218589) :
--
CREATE FUNCTION nir.add_attr_to_obj_varchar (
  namess character varying,
  valuess character varying,
  obj_id integer
)
RETURNS integer
AS
$body$
DECLARE
	id_attr integer;
	id_link integer;
	id_val integer;
BEGIN
	--проверка, нет ли атрибута с таким же именем у документа
	id_attr := nir.addattr(namess,cast(2 as smallint));
	if not exists( SELECT l_id FROM nir.Nir_links WHERE l_id1=obj_id
			AND l_id2=id_attr AND l_id_link_type=5) then
		INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
			VALUES (obj_id, id_attr, 5, 2) returning l_id into id_link;
	else
		id_link := (SELECT l_id FROM nir.Nir_links WHERE l_id1=obj_id
			AND l_id2=id_attr AND l_id_link_type=5 limit 1);
	end if;
	id_val := COALESCE( (SELECT ovv_id FROM nir.Nir_object_value_varchar
			WHERE ovv_link_id=id_link limit 1),0);
  	if id_val>0 then
		UPDATE nir.Nir_object_value_varchar
			SET ovv_value=valuess WHERE ovv_id=id_val;

	else
  		INSERT INTO nir.Nir_object_value_varchar(ovv_value, ovv_link_id)
			VALUES ( valuess, id_link) returning ovv_id into id_val;
	end if;
	return id_val;
END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function add_catalog_template (OID = 218590) :
--
CREATE FUNCTION nir.add_catalog_template (
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	idTemp integer;
BEGIN
	if exists(select o_id, o_name  from nir.Nir_object where o_id_type=15 and upper(o_name) = upper(namess) ) then
		return -1;
	else
		insert into nir.Nir_object (o_name,o_id_type) values (namess,15) returning o_id into idTemp;
		perform nir.set_owner(idTemp);
		return idTemp;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_group (OID = 218591) :
--
CREATE FUNCTION nir.add_group (
  name character varying,
  description character varying
)
RETURNS integer
AS
$body$
DECLARE
g_id integer;
BEGIN
    if (upper(name) in( SELECT upper(r_name) FROM nir.nir_role)) then
	return -2;
end if;
    if exists(select group_id from nir.nir_group where gr_sys_name = name) then
	return -1;
    end if;
    INSERT INTO nir.nir_object (o_name, o_id_type) VALUES (name, 14) returning o_id into g_id;
    INSERT INTO nir.nir_group (group_id, group_name, id_object, gr_sys_name)
        VALUES (g_id, description, g_id, name) returning group_id into g_id;
    --execute 'CREATE GROUP ' || quote_ident($1);
    return g_id;
END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function add_search_template (OID = 218592) :
--
CREATE FUNCTION nir.add_search_template (
  namess character varying,
  sql text
)
RETURNS integer
AS
$body$
DECLARE
	id integer;
	id_link integer;
BEGIN
	if exists(select o_id, o_name  from nir.Nir_object where o_id_type=9 and o_name = namess) then
		return -1;
	else
		insert into nir.Nir_object (o_name,o_id_type) values (namess,9) returning o_id into id;
-- Добавить связть на самаго себя для указания SQL
		if( id is not null) then
			INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
				VALUES (id, id, 11, cast(2 as smallint)) returning l_id into id_link;
			INSERT INTO nir.Nir_object_value_varchar(ovv_value, ovv_link_id)
				VALUES ( sql, id_link);
			perform nir.set_owner( id );
		end if;
		return id;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_tags_to_obj (OID = 218593) :
--
CREATE FUNCTION nir.add_tags_to_obj (
  iddoc integer,
  tag text[] = ARRAY[]::text[]
)
RETURNS integer
AS
$body$
DECLARE idTag integer;
	nameTag text;
	cnt integer;
begin
	cnt=0;
	FOR nameTag IN SELECT tab.val FROM UNNEST(tag) as tab(val)
	LOOP
		idTag := (select nir.addtag(nameTag));
		if not exists (select l_id from nir.Nir_links
			where l_id1=idDoc and l_id2=idTag) then
			insert into nir.Nir_links (l_id1,l_id2, l_id_link_type)
				values (idDoc, idTag, 4);
			cnt = cnt+1;
		end if;
	END LOOP;
	return cnt;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_tema (OID = 218594) :
--
CREATE FUNCTION nir.add_tema (
  namess character varying,
  context text
)
RETURNS integer
AS
$body$
DECLARE
	id integer;
	id_link integer;
	i integer;
BEGIN
	if not exists(select o_id, o_name  from nir.nir_object where o_id_type=17 and upper(o_name) = upper(namess) ) then
		insert into nir.nir_object (o_name,o_id_type) values (namess,17) returning o_id into id;
-- Добавить связть на самаго себя для указания описания
		if( id is not null) then
			INSERT INTO nir.nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
			VALUES (id, id, 8, 2)  returning l_id into id_link;
			INSERT INTO nir.Nir_object_value_varchar(ovv_value, ovv_link_id)
			VALUES ( context, id_link);
		end if;
	end if;
	id = COALESCE( (select o_id from nir.nir_object where o_id_type=17 and upper(o_name) = upper(namess) ) , 0);
	return id;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_template_doc (OID = 218595) :
--
CREATE FUNCTION nir.add_template_doc (
  namess character varying,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$

 DECLARE
	idTemp integer;

begin

	if not exists(SELECT o_id FROM nir.Nir_object WHERE o_name=namess AND o_id_type=7) then

		INSERT INTO nir.Nir_object (o_name,o_id_type) values (namess,7) returning o_id into idTemp;

		--добавляем связь с родительским

		perform nir.add_tags_to_obj(idTemp,tag);

		perform nir.add_atrs_to_obj(idTemp,atr);

		perform nir.set_owner( idTemp );

	else

		idTemp := -1; --означает, что такой doc уже существует

	end if;

	return idTemp;

end;

$body$
LANGUAGE plpgsql;
--
-- Definition for function add_template_kz (OID = 218596) :
--
CREATE FUNCTION nir.add_template_kz (
  namess character varying,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$

 DECLARE
	idKZ integer;

begin

	if not exists(SELECT o_id FROM nir.Nir_object WHERE o_name=namess AND o_id_type=8) then

		INSERT INTO nir.Nir_object (o_name,o_id_type) values (namess,8) returning o_id into idKZ;

		--добавляем связь с родительским

		perform nir.add_tags_to_obj(idKZ,tag);

		perform nir.add_atrs_to_obj(idKZ,atr);

		perform nir.set_owner( idKZ );

	else

		idKZ := -1; --означает, что такой doc уже существует

	end if;

	return idKZ;

end;

$body$
LANGUAGE plpgsql;
--
-- Definition for function add_user (OID = 218597) :
--
CREATE FUNCTION nir.add_user (
  username character varying,
  userdesc character varying
)
RETURNS integer
AS
$body$
DECLARE
u_id integer;
BEGIN
    if (upper(username) in( SELECT upper(r_name) FROM nir.nir_role) ) then
	return -2;
	end if;
    if exists(select user_id_system from nir.nir_user where user_id_system = username) then
    return -1;
    end if;
    INSERT INTO nir.nir_object (o_name, o_id_type) VALUES (username, 2) returning o_id into u_id;
    INSERT INTO nir.nir_user (user_id, user_name, user_id_system, user_id_object)
       VALUES ( u_id, userdesc, username, u_id ) returning user_id into u_id;
    --execute 'CREATE USER ' || quote_ident($1);
    return u_id;

END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function add_user_to_group (OID = 218598) :
--
CREATE FUNCTION nir.add_user_to_group (
  groupname character varying,
  username character varying
)
RETURNS integer
AS
$body$
DECLARE
   gr_name text;
BEGIN
    gr_name = groupname;
    if not exists(select gr_sys_name from nir.nir_group where gr_sys_name = gr_name) then
	return -2;
    end if;
    if not exists(select user_id_system from nir.nir_user where user_id_system = username) then
	return -1;
    end if;
    if exists(select user_id FROM nir.nir_group_user WHERE user_id = (select user_id from nir.nir_user where user_id_system = username)
	and group_id = (select group_id from nir.nir_group where gr_sys_name = gr_name) ) then
	return -3;
    end if;
    --execute 'ALTER GROUP ' || quote_ident($1) ' ADD USER ' || quote_ident($2);

    INSERT INTO nir.nir_group_user (user_id, group_id) VALUES ((SELECT u.user_id FROM nir.nir_user as u  WHERE u.user_id_system = username), (select g.group_id from nir.nir_group as g where g.gr_sys_name = gr_name));
    return 1;
END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function add_user_to_obj (OID = 218599) :
--
CREATE FUNCTION nir.add_user_to_obj (
  iddoc integer,
  iduser integer
)
RETURNS integer
AS
$body$
DECLARE id integer;
begin
	 INSERT INTO nir.Nir_links (l_id1,l_id2,l_id_link_type) values (iddoc,iduser,9) returning l_id into id;
	 return id;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addactions (OID = 218600) :
--
CREATE FUNCTION nir.addactions (
  id_user integer,
  id_obj integer,
  reads integer,
  updates integer,
  deletes integer,
  accesss integer
)
RETURNS integer
AS
$body$

DECLARE
	id_link integer;
	id_val integer;

BEGIN
	if not exists( SELECT l_id FROM nir.Nir_links WHERE l_id1=id_user

			AND l_id2=id_obj AND l_id_link_type=9) then

		insert into nir.Nir_links (l_id1,l_id2, l_id_link_type, l_type_attr_id) values (id_user, id_obj, 9, 4)
		 returning l_id into id_link;

	else
			id_link := (SELECT l_id FROM nir.Nir_links WHERE l_id1=id_user
			AND l_id2=id_obj AND l_id_link_type=9 limit 1);

	end if;
			id_val := COALESCE( (SELECT vam_id FROM nir.Nir_object_value_act_mask

			WHERE vam_link_id=id_link limit 1),0);

			if id_val>0 then

			UPDATE nir.Nir_object_value_act_mask
			SET vam_value=reads WHERE vam_id=id_val;

			UPDATE nir.Nir_object_value_act_mask
			SET vam_value2=updates WHERE vam_id=id_val;

			UPDATE nir.Nir_object_value_act_mask
			SET vam_value3=deletes WHERE vam_id=id_val;

			UPDATE nir.Nir_object_value_act_mask
			SET vam_value4=accesss WHERE vam_id=id_val;

	else

			INSERT INTO nir.Nir_object_value_act_mask(vam_value,vam_value2,vam_value3,vam_value4, vam_link_id)
			VALUES ( reads,updates,deletes,accesss, id_link) returning vam_id into id_val;

	end if;
	return id_val;

END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function addattr (OID = 218601) :
--
CREATE FUNCTION nir.addattr (
  namess character varying,
  type_id smallint = 2
)
RETURNS integer
AS
$body$
DECLARE
	id_attr integer;
	id_link integer;
	i integer;
BEGIN
	if not exists(select o_id, o_name  from nir.nir_object where o_id_type=6 and upper(o_name) = upper(namess) ) then
		insert into nir.nir_object (o_name,o_id_type) values (namess,6) returning o_id into id_attr;
-- Добавить связть на самаго себя для указания типа aтрибута
		if( id_attr is not null) then
			INSERT INTO nir.nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
			VALUES (id_attr, id_attr, 8, type_id);
		end if;
	end if;
	id_attr := COALESCE( (select o_id from nir.nir_object where o_id_type=6 and upper(o_name) = upper(namess) ) , 0);
	return id_attr;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addcatalog (OID = 218602) :
--
CREATE FUNCTION nir.addcatalog (
  namess character varying,
  parent_id integer = 0
)
RETURNS integer
AS
$body$
 DECLARE
	idCatalog integer;
BEGIN
	--проверяем, нет ли у родительского каталога дочернего с таким же именем, который хотим создать
	if not exists(SELECT o_id FROM nir.Nir_object JOIN nir.Nir_links ON l_id1=o_id WHERE l_id2=parent_id AND o_name=namess AND l_id_link_type=1) then
		INSERT INTO nir.Nir_object (o_name,o_id_type) values (namess,4) returning o_id into idCatalog;
		--получаем только что созданный каталог
		--idCatalog := (SELECT o_id FROM Nir_object WHERE o_name = namess ORDER BY o_id DESC LIMIT 1);
		--добавляем связь с родительским
		if parent_id >0 then
			INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type) VALUES (idCatalog, parent_id, 1);
		end if;
		perform nir.set_owner( idCatalog );
	else
		idCatalog := -1; --означает, что такой каталог уже существует
	end if;
	return idCatalog;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addcatalog_by_template (OID = 218603) :
--
CREATE FUNCTION nir.addcatalog_by_template (
  namess character varying,
  parent_id integer,
  temp_id integer
)
RETURNS integer
AS
$body$
 DECLARE
	idCat integer;
BEGIN
	idCat=nir.addcatalog(namess,parent_id);
	perform nir.clone_catalog(temp_id,idCat);
	return idCat;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addcatalog_ext (OID = 218604) :
--
CREATE FUNCTION nir.addcatalog_ext (
  namess character varying,
  parent_id integer,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$
 DECLARE
	idDoc integer;
	type_object integer;
	--user_id integer;
begin
	--user_id := 53;
	idDoc = nir.addcatalog(namess,parent_id);
	if idDoc>0 then
		perform nir.add_tags_to_obj(idDoc,tag);
		perform nir.add_atrs_to_obj(idDoc,atr);
	end if;
	return idDoc;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function adddoc (OID = 218605) :
--
CREATE FUNCTION nir.adddoc (
  namess character varying,
  parent_id integer,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$
 DECLARE idDoc integer;
begin
	if not exists(SELECT o_id FROM nir.Nir_object JOIN nir.Nir_links ON l_id2=o_id WHERE l_id1=parent_id AND o_name=namess AND l_id_link_type=1) then
		INSERT INTO nir.Nir_object (o_name,o_id_type) values (namess,5) returning o_id into idDoc;
		--добавляем связь с родительским
		if parent_id >0 then
			INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type) VALUES (idDoc, parent_id, 1);
		end if;
		perform nir.add_tags_to_obj(idDoc,tag);
		perform nir.add_atrs_to_obj(idDoc,atr);
		perform nir.set_owner( idDoc );
	else
		idDoc := -1; --означает, что такой doc уже существует
	end if;
	return idDoc;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addkz (OID = 218606) :
--
CREATE FUNCTION nir.addkz (
  db integer,
  namess character varying,
  user_id integer,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$
 DECLARE
	idDoc integer;
	type_object integer;
	--user_id integer;
begin
	if db = 1 then
		type_object := 13;
	else
		type_object := 1;
	end if;
	--user_id := 53;
	user_id = nir.get_id_curuser();
	if not exists( SELECT o_id FROM nir.Nir_object JOIN nir.Nir_links ON l_id1=o_id WHERE
		( type_object = 1 and o_id_type = 1 and l_id2 = user_id AND upper(o_name)=upper(namess) and l_id_link_type=9 ) or
		( type_object = 13 and o_id_type = 13 and upper(o_name)=upper(namess) ) ) then
		INSERT INTO nir.Nir_object (o_name,o_id_type) values (namess,type_object) returning o_id into idDoc;
		--добавляем связь с родительским(если это кз)
		--if type_object = 1 then
		--	INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type) VALUES (idDoc, user_id, 9);
		--end if;
		perform nir.set_owner(idDoc);
		perform nir.set_access(idDoc,user_id,b'11111');
		perform nir.add_tags_to_obj(idDoc,tag);
		perform nir.add_atrs_to_obj(idDoc,atr);

		--perform nir.add_user_to_obj(idDoc,user_id);
	else
		idDoc := -1; --означает, что такая КЗ уже существует
	end if;
	return idDoc;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addkzcomment (OID = 218607) :
--
CREATE FUNCTION nir.addkzcomment (
  id_kz integer,
  com_text character varying,
  com_user character varying,
  com_date character varying
)
RETURNS integer
AS
$body$

DECLARE
	idc integer;
	idlink int;
	iduser int;
BEGIN
	--id_type := COALESCE( (SELECT o_id_type FROM nir.nir_object WHERE o_id = id_kz ) , 0);
	--if (id_type = 1) then
	--insert into nir.nir_kzcomment(kc_id_kz, kc_text, kc_user, kc_date) values( id_kz, com_text, com_user, com_date);
	--returning kc_id_comment into id_type;
 	insert into nir.Nir_object (o_name,o_id_type) values (com_text,10) returning o_id into idc;
	--select o_id into iduser from nir.Nir_object where com_user=o_name and o_id_type=2;
	iduser=nir.get_id_curuser();
	INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type,l_type_attr_id)
			VALUES (idc, iduser, 9, 3) returning l_id into idlink;
	INSERT INTO nir.Nir_object_value_datetime(ovd_value, ovd_link_id)
		VALUES ( now(), idlink);
	INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type)
			VALUES (idc, id_kz, 7);
	return idc;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addrole (OID = 218608) :
--
CREATE FUNCTION nir.addrole (
  id_user integer,
  mask character varying
)
RETURNS integer
AS
$body$

DECLARE
	role_id integer;
	id_val integer;

BEGIN
	SELECT count(*) FROM nir.Nir_Role WHERE r_user_id=id_user;
	IF count = 0 THEN
			insert into nir.Nir_Role (r_user_id,r_mask) values (id_user, mask)
			returning r_id into role_id;
	else
			UPDATE nir.Nir_Role
			SET r_mask=mask WHERE r_user_id=id_user;
			role_id = -1;
	end if;
	return role_id;
END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function addtag (OID = 218609) :
--
CREATE FUNCTION nir.addtag (
  namess character varying
)
RETURNS integer
AS
$body$
 --DECLARE objec varchar;
DECLARE idtag integer;
begin
if not exists(select o_id, o_name  from nir.Nir_object where o_id_type=11 and upper(o_name) = upper(namess) ) then
	insert into nir.Nir_object (o_name,o_id_type) values (namess,11);
end if;
idtag := COALESCE( (select o_id from nir.Nir_object where o_id_type=11 and upper(o_name) = upper(namess) ) , 0);
return idtag;
end;

$body$
LANGUAGE plpgsql;
--
-- Definition for function adduser (OID = 218610) :
--
CREATE FUNCTION nir.adduser (
  namess character varying,
  pass character varying,
  info character varying,
  id_system character varying,
  id_object integer
)
RETURNS integer
AS
$body$

DECLARE
	id_user integer;

BEGIN

	if not exists(select o_name  from nir.Nir_object where o_id_type=2 and o_name = namess) then

		insert into nir.Nir_object (o_name,o_id_type) values (namess,2)
		returning o_id into id_user;
		insert into nir.nir_user (u_id, u_login, u_pass, u_info, u_id_system, u_id_object) values (id_user, namess, pass, info, id_system, id_object);

	end if;

	id_user := COALESCE( (select o_id from nir.Nir_object where o_id_type=2 and o_name = namess) , 0);

	return id_user;

END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function adduserrole (OID = 218611) :
--
CREATE FUNCTION nir.adduserrole (
  user_id integer,
  role_id integer
)
RETURNS integer
AS
$body$DECLARE
	mr_id integer;

BEGIN

	insert into nir.Nir_user_role (user_id, role_id) values ( user_id, role_id ) returning user_role_id into mr_id;

	mr_id := COALESCE( (select user_role_id from nir.Nir_user_role where user_role_id = mr_id) , 0);

	return mr_id;

END;$body$
LANGUAGE plpgsql;
--
-- Definition for function bit_to_boolean (OID = 218612) :
--
CREATE FUNCTION nir.bit_to_boolean (
  rt bit varying
)
RETURNS TABLE (
  isreader boolean,
  isworker boolean,
  iseditor boolean,
  isdirector boolean,
  isadmin boolean
)
AS
$body$
DECLARE
BEGIN
	isreader = rt>b'0';
	isworker = rt>b'1';
	iseditor = rt>b'11';
	isdirector = rt>b'111';
	isadmin = rt>b'1111';
	RETURN NEXT;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function boolean_to_bit (OID = 218613) :
--
CREATE FUNCTION nir.boolean_to_bit (
  isreader boolean,
  isworker boolean,
  iseditor boolean,
  isdirector boolean,
  isadmin boolean
)
RETURNS bit varying
AS
$body$
DECLARE
 rt bit varying;
BEGIN
	rt = b'00000';
	if isreader then rt = rt | b'00001'; end if;
	if isworker then rt = rt | b'00010'; end if;
	if iseditor then rt = rt | b'00100'; end if;
	if isdirector then rt = rt | b'01000'; end if;
	if isadmin then rt = rt | b'10000'; end if;
	RETURN rt;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function boolean_to_bit_2 (OID = 218614) :
--
CREATE FUNCTION nir.boolean_to_bit_2 (
  isreader boolean,
  isworker boolean,
  iseditor boolean,
  isdirector boolean,
  isadmin boolean
)
RETURNS bit varying
AS
$body$
DECLARE
 rt bit varying;
BEGIN
	rt = b'0';
	if isreader then rt = b'1'; end if;
	if isworker then rt = b'11'; end if;
	if iseditor  then rt = b'111'; end if;
	if isdirector then rt = b'1111'; end if;
	if isadmin then rt = b'11111'; end if;
	RETURN rt;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function change_mask_korn (OID = 218615) :
--
CREATE FUNCTION nir.change_mask_korn (
  id_role integer,
  mask character varying
)
RETURNS integer
AS
$body$DECLARE
		result_value integer;
BEGIN
		IF EXISTS( SELECT r_id FROM nir.Nir_role WHERE r_id=id_role ) THEN
			UPDATE nir.Nir_role
			SET r_mask=mask WHERE r_id=id_role;
			result_value = -1;
		ELSE
			result_value = 0;
		END IF;
		RETURN result_value;
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function change_parents_rights (OID = 218616) :
--
CREATE FUNCTION nir.change_parents_rights (
  id_obj integer
)
RETURNS TABLE (
  parent_id integer
)
AS
$body$
WITH recursive parents AS
(
select 1 as n_parent, l_id2 as parent_id, l_id1 as obj_id
  FROM nir.nir_links where l_id1 =$1 and
	l_id_link_type=1
union all
 SELECT (n_parent+1) as n_parent, l_id2 as parent_id, l_id1 as obj_id
  FROM  parents left join nir.nir_links on parent_id = l_id1
	where l_id_link_type=1
)
select parent_id
from parents left join nir.nir_object o on obj_id = o.o_id
	left join nir.nir_object p on parent_id = p.o_id
where o.o_id_type=4 or o.o_id_type=5
order by n_parent desc;
$body$
LANGUAGE sql;
--
-- Definition for function change_parents_rights (OID = 218617) :
--
CREATE FUNCTION nir.change_parents_rights (
  id_obj integer,
   rightsss_of_access[]
)
RETURNS TABLE (
  n_parent integer
)
AS
$body$
declare
id integer;
count integer;
element_str text;
element nir.change_rights_type;
massive nir.change_rights_type[];
massive_of_parents integer[];
begin

WITH recursive parents AS
(
select 1 as n_parent, l_id2 as parent_id, l_id1 as obj_id
FROM nir.nir_links where l_id1 =$1 and
l_id_link_type=1
union all
SELECT (n_parent+1) as n_parent, l_id2 as parent_id, l_id1 as obj_id
FROM parents left join nir.nir_links on parent_id = l_id1
where l_id_link_type=1
)
select array(select  (parent_id) :: integer
from parents left join nir.nir_object o on obj_id = o.o_id
left join nir.nir_object p on parent_id = p.o_id
where o.o_id_type=4 or o.o_id_type=5
order by n_parent desc) as massive_of_parents;
FOR i in 1..array_length(massive_of_parents,1)
	LOOP
	id = massive_of_parents[i];
	insert into nir.rights_access(roa_id_object) values(id);
	--count = count+1;
	end LOOP;


end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changename_alert (OID = 218618) :
--
CREATE FUNCTION nir.changename_alert (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
begin
	if exists(SELECT o_id from nir.all_templates_view where o_id_type=16 and o_name = namess and user_id_system=current_user and o_id<>id ) then
		return -1; -- Такая уже есть
	else
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=16 returning o_id into num;
		return COALESCE(num,0);
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changename_attr (OID = 218619) :
--
CREATE FUNCTION nir.changename_attr (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
begin
	if exists(SELECT o_id FROM nir.Nir_object WHERE o_name=namess and o_id_type=6 and o_id<>id) then
		return -1; -- Такая БД уже есть
	else
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=6 returning o_id into num;
		return COALESCE(num,0);
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changename_cat_template (OID = 218620) :
--
CREATE FUNCTION nir.changename_cat_template (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
begin
	if exists(SELECT o_id FROM nir.Nir_object WHERE o_name=namess and o_id_type=15 and o_id<>id ) then
		return -1; -- Такая уже есть
	else
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=15 returning o_id into num;
		return COALESCE(num,0);
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changename_search_template (OID = 218621) :
--
CREATE FUNCTION nir.changename_search_template (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
begin
	if exists(SELECT o_id FROM nir.Nir_object WHERE o_name=namess and o_id_type=9 and o_id<>id ) then
		return -1; -- Такая уже есть
	else
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=9 returning o_id into num;
		return COALESCE(num,0);
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changename_tag (OID = 218622) :
--
CREATE FUNCTION nir.changename_tag (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
begin
	if exists(SELECT o_id FROM nir.Nir_object WHERE o_name=namess and o_id_type=11 and o_id<>id ) then
		return -1; -- Такая уже есть
	else
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=11 returning o_id into num;
		return COALESCE(num,0);
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changenamecatalog (OID = 218623) :
--
CREATE FUNCTION nir.changenamecatalog (
  id integer,
  parent_id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	id_check integer;
begin
	--получаем каталоги из Nir_object с таким же именем, которое м\хотим присвоить
	if not exists(SELECT l_id FROM nir.Nir_object join nir.Nir_links
			on o_id=l_id1
			WHERE l_id2=parent_id
			AND o_name=namess AND l_id_link_type=1 AND l_id1<>id) then
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=4 returning o_id into id_check;
		if id_check is null then
			return 0;
		else
			return 1;
		end if;
	else
		return -1;
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changenamedb (OID = 218624) :
--
CREATE FUNCTION nir.changenamedb (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
begin
	if exists(SELECT o_id FROM nir.Nir_object WHERE o_name=namess and o_id_type=13 and o_id<>id) then
		return -1; -- Такая БД уже есть
	else
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=13 returning o_id into num;
		return COALESCE(num,0);
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changenamedoc (OID = 218625) :
--
CREATE FUNCTION nir.changenamedoc (
  id integer,
  parent_id integer,
  namess character varying
)
RETURNS integer
AS
$body$
BEGIN
	if not exists(SELECT o_id FROM nir.Nir_object JOIN nir.Nir_links ON l_id1=o_id WHERE l_id2=parent_id AND o_name=namess AND l_id_link_type=1) then
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=5;
		if exists(SELECT o_id FROM nir.Nir_object JOIN nir.Nir_links ON l_id1=o_id WHERE l_id2=parent_id AND o_name=namess AND l_id_link_type=1) then
			return 1;
		else
			return 0;
		end if;
	end if;
	return -1;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changenamekz (OID = 218626) :
--
CREATE FUNCTION nir.changenamekz (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
	user_id integer;
begin
	user_id = (select l_id2 from nir.Nir_links WHERE l_id1=id AND l_id_link_type=9 limit 1);
	if exists(SELECT l_id FROM nir.Nir_object JOIN nir.Nir_links ON l_id1=o_id
		WHERE l_id1<> id AND l_id2=user_id AND o_name=namess AND l_id_link_type=9) then
		return -1;
	else
		UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=1 returning o_id into num;
		return COALESCE(num,0);
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function clone_catalog (OID = 218627) :
--
CREATE FUNCTION nir.clone_catalog (
  src_id integer,
  dest_id integer
)
RETURNS integer
AS
$body$
 DECLARE
	idNew integer;
	cid int;
	cname text;
	sum int;
BEGIN
	sum=0;
	FOR cid, cname IN SELECT obj_id, obj_name FROM nir.cats_of_cat_view where parent_id=src_id
	LOOP
		idNew = nir.addcatalog(cname,dest_id);
		perform nir.clone_catalog(cid,idNew);
		sum = sum+1;
	END LOOP;
	return sum;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function clone_catalog_to_template (OID = 218628) :
--
CREATE FUNCTION nir.clone_catalog_to_template (
  namess character varying,
  cat_id integer
)
RETURNS integer
AS
$body$
 DECLARE
	idTemp integer;
	cid int;
	cname text;
BEGIN
	if exists(select o_id, o_name  from nir.Nir_object where o_id_type=15 and upper(o_name) = upper(namess) ) then
		return -1;
	else
		insert into nir.Nir_object (o_name,o_id_type) values (namess,15) returning o_id into idTemp;
		perform nir.clone_catalog(cat_id,idTemp);
		return idTemp;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function copy_alert (OID = 218629) :
--
CREATE FUNCTION nir.copy_alert (
  idtemp integer,
  name1 text = NULL::text
)
RETURNS integer
AS
$body$
DECLARE
	idnew integer;
	idtype int;
	namess text;
	--val text;
	--typ smallint;
begin
	if( name1 is NULL) then
		namess = COALESCE( (select o_name from nir.nir_object where o_id=idtemp),'' );
		namess = 'копия ' || namess;
	else
		namess=name1;
	end if;

	idtype = COALESCE( (select o_id_type from nir.nir_object where o_id=idtemp), 0);
	if( idtype=16 OR idtype=9) then
		idnew = nir.add_alert(namess, (SELECT sql_txt  FROM nir.all_search_templates_view where o_id=idTemp) );
	end if;
	return idnew;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function copy_catalog (OID = 218630) :
--
CREATE FUNCTION nir.copy_catalog (
  src_id integer,
  par_id integer
)
RETURNS TABLE (
  id_old integer,
  file_old text,
  id_new integer
)
AS
$body$
 DECLARE
	idNew integer;
	cid int;
	cname text;
	ctype int;
	nameNew text;
	tagWork text[];
	atrWork nir.atrtype[];
BEGIN
	nameNew = COALESCE( (select o_name from nir.nir_object where o_id = src_id ), 'копия');
	while exists ( SELECT obj_id  FROM nir.nir_parent_view where upper(obj_name) = upper(nameNew) and parent_id=par_id) loop
		nameNew = 'копия ' || nameNew;
	end loop;
	SELECT array_agg(tag_name) into tagWork from nir.get_tags_obj(src_id);
	SELECT array_agg( (atr_type, atr_name, atr_value)::nir.atrtype ) into atrWork from nir.get_atrs_obj(src_id);
	idNew = (select nir.addcatalog_ext(nameNew, par_id, tagWork, atrWork));
	if idNew <=0 then
		id_old=-1;
		id_new=-1;
		file_old='';
		return next;
	else
		FOR cid, cname, ctype IN SELECT obj_id, obj_name, obj_type FROM nir.nir_parent_view where parent_id=src_id
		LOOP
			if ctype=4 then
				for id_old, file_old, id_new in select * from nir.copy_catalog(cid,idNew) loop
					return next;
				end loop;
			elsif ctype=5 then
				id_old = cid;
				file_old = (SELECT o_name_1 FROM nir.links_view where o_type_1=12 and l_id_link_type=10 and o_id_2=cid);
				id_new = (select nir.copy_doc(cid,'',idNew) );
				return next;
			end if;
		END LOOP;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function copy_doc (OID = 218631) :
--
CREATE FUNCTION nir.copy_doc (
  iddoc integer,
  namess character varying,
  par_id integer
)
RETURNS integer
AS
$body$
DECLARE
	tagWork text[];
	atrWork nir.atrtype[];
	idNew int;
	nameNew text;
begin
	if( namess='' ) then
		nameNew = COALESCE( (select o_name from nir.nir_object where o_id = idDoc ), 'копия');
	else
		nameNew = namess;
	end if;
	while exists ( SELECT obj_id  FROM nir.nir_parent_view where upper(obj_name) = upper(nameNew) and parent_id=par_id) loop
		nameNew = 'копия ' || nameNew;
	end loop;
	SELECT array_agg(tag_name) into tagWork from nir.get_tags_obj(iddoc);
	SELECT array_agg( (atr_type, atr_name, atr_value)::nir.atrtype ) into atrWork from nir.get_atrs_obj(iddoc);
	idNew = (select nir.adddoc(nameNew, par_id, tagWork, atrWork));
	return idNew;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function copy_template (OID = 218632) :
--
CREATE FUNCTION nir.copy_template (
  idtemp integer,
  name1 text = NULL::text
)
RETURNS integer
AS
$body$
DECLARE
	idnew integer;
	idtype int;
	tags text[];
	atrs nir.atrtype[];
	namess text;
	--val text;
	--typ smallint;
begin
	if( name1 is NULL) then
		namess = COALESCE( (select o_name from nir.nir_object where o_id=idtemp),'' );
		namess = 'копия ' || namess;
	else
		namess=name1;
	end if;

	idtype = COALESCE( (select o_id_type from nir.nir_object where o_id=idtemp), 0);
	tags =  ARRAY( SELECT tag_name  FROM nir.tags_view where obj_id=idTemp)::text[];
	atrs =  ARRAY(SELECT ROW(cast(atr_type as smallint), atr_name, atr_value)::nir.atrtype as atr  FROM nir.atrs_view_2 where obj_id=idTemp)::nir.atrtype[];
	case
	when idtype=7 then
		idnew = nir.add_template_doc(namess, tags, atrs);
	when idtype=8 then
		idnew = nir.add_template_kz(namess, tags, atrs);
	when idtype=9 then
		idnew = nir.add_search_template(namess, (SELECT sql_txt  FROM nir.all_search_templates_view where o_id=idTemp) );
	end case;
	return idnew;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function datafromgetusers (OID = 218633) :
--
CREATE FUNCTION nir.datafromgetusers (
)
RETURNS TABLE (
  user_id_object integer,
  user_name character varying
)
AS
$body$
SELECT user_id_object, user_name FROM nir.getusers()
$body$
LANGUAGE sql;
--
-- Definition for function del_atrs_from_obj (OID = 218634) :
--
CREATE FUNCTION nir.del_atrs_from_obj (
  iddoc integer,
  atr text[]
)
RETURNS void
AS
$body$
begin
	delete from nir.Nir_links WHERE l_id1=iddoc AND l_id2 in
		(select o_id from nir.Nir_object
			where o_id_type=6 AND o_name in (select a from UNNEST(atr) a) );
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function del_links_from_obj (OID = 218635) :
--
CREATE FUNCTION nir.del_links_from_obj (
  iddoc integer,
  tag integer[]
)
RETURNS void
AS
$body$
begin
	delete from nir.Nir_links WHERE l_id1=iddoc AND l_id2 in (select a from UNNEST(tag) a);
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function del_tags_from_obj (OID = 218636) :
--
CREATE FUNCTION nir.del_tags_from_obj (
  iddoc integer,
  tag text[]
)
RETURNS void
AS
$body$
begin
	delete from nir.Nir_links WHERE l_id1=iddoc AND l_id2 in
		(select o_id from nir.Nir_object
			where o_id_type=11 AND o_name in (select a from UNNEST(tag) a) );
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function del_user_from_group (OID = 218637) :
--
CREATE FUNCTION nir.del_user_from_group (
  groupname character varying,
  username character varying
)
RETURNS integer
AS
$body$
DECLARE
   gr_name text;
   u_id integer;
BEGIN
    gr_name = groupname;
    if not exists(select gr_sys_name from nir.nir_group where gr_sys_name = gr_name) then
	return -2;
    end if;
    if not exists(select user_id_system from nir.nir_user where user_id_system = username) then
	return -1;
    end if;
    if not exists(select user_id FROM nir.nir_group_user WHERE user_id = (select user_id from nir.nir_user where user_id_system = username)
	and group_id = (select group_id from nir.nir_group where gr_sys_name = gr_name) ) then
	return -3;
    end if;
      --DELETE FROM nir.Nir_User WHERE user_id_system = username returning user_id into u_id;
      SELECT user_id INTO u_id FROM nir.nir_user WHERE user_id_system = username;
      DELETE FROM nir.nir_group_user WHERE user_id = u_id and group_id=(select group_id from nir.nir_group where gr_sys_name = gr_name) ;
      --execute 'ALTER GROUP ' || quote_ident($1) ' DROP USER ' || quote_ident($2);
    return 1;
END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function delete_right_of_access (OID = 218638) :
--
CREATE FUNCTION nir.delete_right_of_access (
  id_object integer,
  id_users integer[]
)
RETURNS integer
AS
$body$
DECLARE
	count integer;
	id_user integer;
BEGIN
	count = 0;
	FOR i in 1..array_length(id_users,1)
	LOOP
		id_user = id_users[i];
		IF(id_user is not null) THEN
		DELETE FROM nir.rights_access WHERE roa_id_object=id_object AND roa_id_subject = id_user;
		count = count+1;
		ELSE
			count = 0;
		END IF;

	END LOOP;
	RETURN count;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function downloadfile (OID = 218639) :
--
CREATE FUNCTION nir.downloadfile (
  iddoc integer
)
RETURNS TABLE (
  id integer,
  filename character varying
)
AS
$body$
	SELECT o_id as id, o_name as filename FROM nir.Nir_object
		JOIN nir.Nir_links ON l_id1=o_id WHERE l_id2=$1 AND l_id_link_type=10;
$body$
LANGUAGE sql;
--
-- Definition for function drop_alert (OID = 218640) :
--
CREATE FUNCTION nir.drop_alert (
  idcat integer
)
RETURNS integer
AS
$body$
declare id int;
begin
	delete from nir.nir_object where o_id=idCat and o_id_type=16 returning o_id into id; --удаление дока
	return COALESCE(id,-1);
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_attr (OID = 218641) :
--
CREATE FUNCTION nir.drop_attr (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
 did integer;
BEGIN
 did=0;
 --if exists(select * from nir.nir_object where o_id=id and o_name like '--%') then
	DELETE FROM nir.Nir_object WHERE o_id = id and o_id_type=6
		returning o_id into did;
 --end if;
	return COALESCE(did,0);
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_catalog (OID = 218642) :
--
CREATE FUNCTION nir.drop_catalog (
  idcat integer
)
RETURNS integer
AS
$body$
DECLARE
	--i integer;
	cid int;
	ctype int;
	cname text;
	pid int;
	--obj integer[];
	--objj integer[];
begin
 --if exists(select * from nir.nir_object where o_id=idcat and ( (o_id_type in (1,13) and o_name like '--%') or o_id_type=4) ) then
 --or exists(select o_id from nir.nir_object where o_id=nir.get_id_top(idcat) and o_name like '--%')  then
--	SELECT array_agg(parent_id, o_id, o_id_type) INTO obj FROM nir.get_objs_in_catalog(idCat);
	FOR  pid,cid,cname,ctype IN SELECT parent_id,o_id,o_name,o_id_type from nir.get_objs_in_catalog( idCat)
	LOOP
		--objj := obj[i];

		if ctype=5 then
			--perform nir.drop_file_by_id_doc(cid); -- удаление ссылки на файл
			perform nir.dropdoc(cid); --удаление дока
		end if;
		if ctype=4 then
			--perform nir.dropobj(cid); --удаление рубрики как объекта (с удаление всех связей)
			perform nir.drop_catalog(cid); --удаление рубрики как объекта (с удаление всех связей)
		end if;

	END LOOP;
	--perform nir.dropdoc(idCat); --удаление дока
	--perform nir.dropobj(cid); --удаление рубрики как объекта (с удаление всех связей)
	return nir.dropobj(idcat);
--else
--	return 0;
--end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_file (OID = 218643) :
--
CREATE FUNCTION nir.drop_file (
  idfile integer
)
RETURNS integer
AS
$body$
BEGIN
	DELETE FROM nir.Nir_object WHERE o_id=idfile;
	RETURN 1;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_file_by_id_doc (OID = 218644) :
--
CREATE FUNCTION nir.drop_file_by_id_doc (
  iddoc integer
)
RETURNS integer
AS
$body$
DECLARE
	id_file integer;
BEGIN
	--id_file := (SELECT l_id1 FROM nir.Nir_links WHERE l_id2=iddoc AND l_id_link_type=10); --получение id файла по id документа
	DELETE FROM nir.Nir_object WHERE o_id_type=12 and
		o_id in (SELECT l_id1 FROM nir.Nir_links WHERE l_id2=iddoc AND l_id_link_type=10) returning o_id into id_file;
	if id_file > 0 then
		RETURN id_file;
	else
		RETURN 0;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_group (OID = 218645) :
--
CREATE FUNCTION nir.drop_group (
  name character varying
)
RETURNS integer
AS
$body$
DECLARE
g_id integer;
BEGIN
    if (upper(name) in( SELECT upper(r_name) FROM nir.nir_role)) then
	return -2;
end if;
    if not exists(select gr_sys_name from nir.nir_group where gr_sys_name = name) then
    return -1;
    end if;
   -- DELETE FROM nir.nir_group_user WHERE group_id = g_id;
    DELETE FROM nir.nir_group WHERE gr_sys_name = name returning group_id into g_id;
    DELETE FROM nir.nir_object WHERE o_id = g_id;
    --execute 'DROP GROUP ' || quote_ident($1);
    return 1;

END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function drop_search_template (OID = 218646) :
--
CREATE FUNCTION nir.drop_search_template (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
 did integer;
BEGIN
	DELETE FROM nir.Nir_object WHERE o_id = id AND o_id_type = 9 returning o_id into did;
	return did;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_tag (OID = 218647) :
--
CREATE FUNCTION nir.drop_tag (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
 did integer;
BEGIN
 did=0;
 --if exists(select * from nir.nir_object where o_id=id and o_name like '--%') then
	DELETE FROM nir.Nir_object WHERE o_id = id and o_id_type=11
		returning o_id into did;
 --end if;
	return COALESCE(did,0);
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_template (OID = 218648) :
--
CREATE FUNCTION nir.drop_template (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
BEGIN
	DELETE FROM nir.Nir_object WHERE o_id = id;
	return 1;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function drop_user (OID = 218649) :
--
CREATE FUNCTION nir.drop_user (
  username character varying
)
RETURNS integer
AS
$body$
DECLARE
u_id integer;
BEGIN
    if (upper(username) in( SELECT upper(r_name) FROM nir.nir_role)) then
	return -2;
	end if;
    if not exists(select user_id_system from nir.nir_user where user_id_system = username) then
    return -1;
    end if;
  --  DELETE FROM nir.nir_group_user WHERE user_id = u_id;
    DELETE FROM nir.nir_user WHERE user_id_system = username returning user_id into u_id;
    --DELETE FROM nir.nir_object WHERE o_id = u_id;
    --execute 'DROP USER ' || quote_ident($1);
    return 1;

END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function dropatr (OID = 218650) :
--
CREATE FUNCTION nir.dropatr (
  id integer,
  id_parent integer
)
RETURNS integer
AS
$body$
DECLARE
BEGIN	--удаление связей с атрибутом
	DELETE FROM nir.Nir_links WHERE l_id1 = id AND l_id2 = id_parent AND l_id_link_type = 5;
	if not exists(SELECT l_id FROM nir.Nir_links WHERE l_id2=id_parent AND l_id1=id AND l_id_link_type=5) then
		return 1;
	else
		return 0;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function dropcat_template (OID = 218651) :
--
CREATE FUNCTION nir.dropcat_template (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
 did integer;
BEGIN
 did=0;
 --if exists(select * from nir.nir_object where o_id=id and o_name like '--%') then
	DELETE FROM nir.Nir_object WHERE o_id = id AND o_id_type = 15 returning o_id into did;
 --end if;
	return did;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function dropcomment (OID = 218652) :
--
CREATE FUNCTION nir.dropcomment (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
 did integer;
BEGIN
	DELETE FROM nir.Nir_object WHERE o_id = id and o_id_type=10 returning o_id into did;
	return did;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function dropdoc (OID = 218653) :
--
CREATE FUNCTION nir.dropdoc (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
BEGIN
	--Удаление самого документа из таблицы Nir_object
 --if exists(select * from nir.nir_object where o_id=id and o_name like '--%')
--or exists(select o_id from nir.nir_object where o_id=nir.get_id_top(id) and o_name like '--%') then
	perform nir.drop_file_by_id_doc(id); -- удаление ссылки на файл
	DELETE FROM nir.Nir_object WHERE o_id = id;
	return 1;
 --else
--	return 0;
 --end if;

END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function dropmodule (OID = 218654) :
--
CREATE FUNCTION nir.dropmodule (
  id integer
)
RETURNS integer
AS
$body$

DECLARE

 did integer;

BEGIN

	DELETE FROM nir.Nir_module WHERE module_id = id returning module_id into did;

	return did;

END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function dropmodulerole (OID = 218655) :
--
CREATE FUNCTION nir.dropmodulerole (
  id integer
)
RETURNS integer
AS
$body$

DECLARE

 did integer;

BEGIN

	DELETE FROM nir.Nir_module_role WHERE module_role_id = id returning module_role_id into did;

	return did;

END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function dropobj (OID = 218656) :
--
CREATE FUNCTION nir.dropobj (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
 did integer;
BEGIN
	DELETE FROM nir.Nir_object n WHERE n.o_id = id --and
		--(n.o_name like '--%' or exists(select o.o_id from nir.nir_object o where o.o_id=nir.get_id_top(id) and o.o_name like '--%') )
		returning n.o_id into did;
	return did;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function droprole (OID = 218657) :
--
CREATE FUNCTION nir.droprole (
  id integer
)
RETURNS integer
AS
$body$

DECLARE

 did integer;

BEGIN

	DELETE FROM nir.Nir_role WHERE r_id = id returning r_id into did;

	return did;

END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function droptag (OID = 218658) :
--
CREATE FUNCTION nir.droptag (
  id integer,
  id_parent integer
)
RETURNS integer
AS
$body$
 DECLARE
BEGIN
	--удаление связей с тегом
	DELETE FROM nir.Nir_links WHERE l_id1 = id AND l_id2 = id_parent AND l_id_link_type = 4;
	--проверка удалился ли объект
	if not exists(SELECT l_id FROM nir.Nir_links WHERE l_id1 = id AND l_id2 = id_parent AND l_id_link_type = 4) then
		return 1;
	else
		return 0;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function dropuser (OID = 218659) :
--
CREATE FUNCTION nir.dropuser (
  id integer
)
RETURNS integer
AS
$body$

DECLARE

 did integer;

BEGIN

	DELETE FROM nir.Nir_User WHERE u_id = id returning u_id into did;
	DELETE FROM nir.Nir_object WHERE o_id = id AND o_id_type = 2;

	return did;

END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function dropuserrole (OID = 218660) :
--
CREATE FUNCTION nir.dropuserrole (
  id integer
)
RETURNS integer
AS
$body$

DECLARE

 did integer;

BEGIN

	DELETE FROM nir.Nir_user_role WHERE user_role_id = id returning user_role_id into did;

	return did;

END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function edit_kzcomment (OID = 218661) :
--
CREATE FUNCTION nir.edit_kzcomment (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	num integer;
begin
	UPDATE nir.Nir_object SET o_name = namess WHERE o_id = id AND o_id_type=10 returning o_id into num;
	return COALESCE(num,0);
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function edit_template (OID = 218662) :
--
CREATE FUNCTION nir.edit_template (
  id integer,
  namess character varying,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$

DECLARE	tagOld text[];
	atrOld text[];
	tagWork text[];
	atrWork text[];
begin
	UPDATE nir.Nir_object SET o_name = namess WHERE o_id=id;

	SELECT array_agg(tag_name) into tagOld from nir.get_tags_obj(id);

	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tagOld) a) except (select a from UNNEST(tag) a) ) v;
	perform nir.del_tags_from_obj(id,tagWork);

	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tag) a) except (select a from UNNEST(tagOld) a) ) v;
	perform nir.add_tags_to_obj(id,tagWork);

	SELECT array_agg(atr_name) into atrOld from nir.get_atrs_obj(id);

	select array_agg(v.a) into atrWork from
		( (select a from UNNEST( atrOld) a) except (select a.aname from UNNEST(atr) a) ) v;
	perform nir.del_atrs_from_obj(id,atrWork);

	perform nir.add_atrs_to_obj(id,atr);

	return id;
/*	UPDATE nir.Nir_object SET o_name = namess WHERE o_id=id;
	SELECT array_agg(tag_name) into tagOld from nir.get_tags_obj(id);
	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tagOld) a) except (select a from UNNEST(tag) a) ) v;
	perform nir.del_tags_from_obj(id,tagWork);
	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tag) a) except (select a from UNNEST(tagOld) a) ) v;
	perform nir.add_tags_to_obj(id,tagWork);
--	perform nir.add_atrs_to_obj(idDoc,tagWork);
	perform nir.add_atrs_to_obj(id,atr::nir.atrtype[]);
	return id; */
end;

$body$
LANGUAGE plpgsql;
--
-- Definition for function editcatalog (OID = 218663) :
--
CREATE FUNCTION nir.editcatalog (
  iddoc integer,
  namess character varying,
  parent_id integer,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$
DECLARE
	tagOld text[];
	atrOld text[];
	--tagNew text[];
	tagWork text[];
	atrWork text[];
begin
	--UPDATE nir.Nir_object SET o_name = namess WHERE o_id=idDoc;
	perform nir.changenamecatalog(iddoc,parent_id,namess);
	if parent_id >0 then
		UPDATE	nir.Nir_links SET l_id2=parent_id
			WHERE l_id1=idDoc AND l_id_link_type=1;
	end if;

	SELECT array_agg(tag_name) into tagOld from nir.get_tags_obj(iddoc);

	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tagOld) a) except (select a from UNNEST(tag) a) ) v;
	perform nir.del_tags_from_obj(idDoc,tagWork);

	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tag) a) except (select a from UNNEST(tagOld) a) ) v;
	perform nir.add_tags_to_obj(idDoc,tagWork);

	SELECT array_agg(atr_name) into atrOld from nir.get_atrs_obj(iddoc);

	select array_agg(v.a) into atrWork from
		( (select a from UNNEST( atrOld) a) except (select a.aname from UNNEST(atr) a) ) v;
	perform nir.del_atrs_from_obj(idDoc,atrWork);

	perform nir.add_atrs_to_obj(idDoc,atr);

	return idDoc;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function editdoc (OID = 218664) :
--
CREATE FUNCTION nir.editdoc (
  iddoc integer,
  namess character varying,
  parent_id integer,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$
DECLARE
	tagOld text[];
	atrOld text[];
	--tagNew text[];
	tagWork text[];
	atrWork text[];
begin
	--UPDATE nir.Nir_object SET o_name = namess WHERE o_id=idDoc;
	perform nir.changenamedoc(iddoc,parent_id,namess);
	if parent_id >0 then
		UPDATE	nir.Nir_links SET l_id2=parent_id
			WHERE l_id1=idDoc AND l_id_link_type=1;
	end if;

	SELECT array_agg(tag_name) into tagOld from nir.get_tags_obj(iddoc);

	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tagOld) a) except (select a from UNNEST(tag) a) ) v;
	perform nir.del_tags_from_obj(idDoc,tagWork);

	select array_agg(v.a) into tagWork from
		( (select a from UNNEST( tag) a) except (select a from UNNEST(tagOld) a) ) v;
	perform nir.add_tags_to_obj(idDoc,tagWork);

	SELECT array_agg(atr_name) into atrOld from nir.get_atrs_obj(iddoc);

	select array_agg(v.a) into atrWork from
		( (select a from UNNEST( atrOld) a) except (select a.aname from UNNEST(atr) a) ) v;
	perform nir.del_atrs_from_obj(idDoc,atrWork);

	perform nir.add_atrs_to_obj(idDoc,atr);

	return idDoc;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function editkz (OID = 218665) :
--
CREATE FUNCTION nir.editkz (
  db integer,
  idkz integer,
  namess character varying,
  tag text[] = ARRAY[]::text[],
  atr atrtype[] = ARRAY[]::nir.atrtype[]
)
RETURNS integer
AS
$body$
DECLARE
	tagOld text[];
	atrOld text[];
	tagWork text[];
	atrWork text[];
begin

	--UPDATE nir.Nir_object SET o_name = namess WHERE o_id=idkz;
	if db = 1 then
		perform nir.changenamedb(idkz,namess);
	else
		perform nir.changenamekz(idkz,namess);
	end if;

	SELECT array_agg(tag_name) into tagOld from nir.get_tags_obj(idkz);

	select array_agg(v.a) into tagWork from

		( (select a from UNNEST( tagOld) a) except (select a from UNNEST(tag) a) ) v;

	perform nir.del_tags_from_obj(idkz,tagWork);

	select array_agg(v.a) into tagWork from

		( (select a from UNNEST( tag) a) except (select a from UNNEST(tagOld) a) ) v;

	perform nir.add_tags_to_obj(idkz,tagWork);

--	perform nir.add_atrs_to_obj(idDoc,tagWork);
--	perform nir.add_atrs_to_obj(idkz,atr);
	SELECT array_agg(atr_name) into atrOld from nir.get_atrs_obj(idkz);

	select array_agg(v.a) into atrWork from
		( (select a from UNNEST( atrOld) a) except (select a.aname from UNNEST(atr) a) ) v;
	perform nir.del_atrs_from_obj(idkz,atrWork);

	perform nir.add_atrs_to_obj(idkz,atr);

	return idkz;

end;

$body$
LANGUAGE plpgsql;
--
-- Definition for function find_doc (OID = 218666) :
--
CREATE FUNCTION nir.find_doc (
  array_tag text[] = NULL::text[],
  array_atr atrtype[] = NULL::nir.atrtype[]
)
RETURNS TABLE (
  o_id integer,
  o_name text,
  path text
)
AS
$body$
select o_id, o_name, nir.get_parent_path(o_id) as path from nir.all_docs_view as d where
not exists(
(select upper(t) from UNNEST($1) as t)
except
(SELECT upper(t.tag_name)
  FROM nir.tags_view t
 where t.obj_id=o_id)
)
AND
not exists
((
select a.aname,a.avalue from UNNEST( $2) as a
)
except
(
SELECT atr_name as aname,atr_value as avalue
  FROM nir.atrs_view_2
 where obj_id=o_id
))
and
not exists
(
SELECT obj_id, atr_name, atr_value, a.avalue
  FROM nir.atrs_view_2, UNNEST( $2 ) as a
where atr_name=a.aname and cast(atr_value as text)<>cast(a.avalue as text)
);
$body$
LANGUAGE sql;
--
-- Definition for function find_doc_by_tag (OID = 218667) :
--
CREATE FUNCTION nir.find_doc_by_tag (
  array_tag text[] = NULL::text[]
)
RETURNS TABLE (
  o_id integer,
  o_name text,
  path text
)
AS
$body$
select o_id, o_name, nir.get_parent_path(o_id) as path
	from nir.all_docs_view as d where
not exists(
(select upper(t) from UNNEST($1) as t)
except
(SELECT upper(t.tag_name)
  FROM nir.tags_view t
 where t.obj_id=o_id)
);
$body$
LANGUAGE sql;
--
-- Definition for function find_doc_by_tag (OID = 218668) :
--
CREATE FUNCTION nir.find_doc_by_tag (
  parent_id integer,
  array_tag text[] = NULL::text[]
)
RETURNS TABLE (
  o_id integer,
  o_name text,
  path text
)
AS
$body$
select o_id, o_name, nir.get_parent_path(o_id) as path
 from nir.get_objs_in_catalog($1) as d where
 o_id_type=5 and
not exists(
(select upper(t) from UNNEST($2) as t)
except
(SELECT upper(t.tag_name)
  FROM nir.tags_view t
 where t.obj_id=o_id)
);
$body$
LANGUAGE sql;
--
-- Definition for function get_access (OID = 218669) :
--
CREATE FUNCTION nir.get_access (
  object_id integer
)
RETURNS TABLE (
  isreader boolean,
  isworker boolean,
  iseditor boolean,
  isdirector boolean,
  isadmin boolean
)
AS
$body$
DECLARE
 rt bit varying;
 objid int;
 parid int;
 user_id int;
--isreader boolean;
 --isworker boolean;
 --iseditor boolean;
 --isdirector boolean;
 --isadmin boolean;
BEGIN
	user_id = COALESCE((select o_id from nir.full_users_view where user_id_system=current_user),0);
	objid=$1;
	rt = COALESCE((SELECT  roa_bit_map from nir.rights_access
		    where roa_id_object=objid and roa_id_subject = user_id), b'0');
	parid = COALESCE((select l_id2 from nir.nir_links where l_id1=objid and l_id_link_type=1),0);
	WHILE ( rt=b'0' AND parid>0 ) LOOP
		objid=parid;
		rt = COALESCE((SELECT  roa_bit_map from nir.rights_access
		    where roa_id_object=objid and roa_id_subject = user_id),b'0');
		parid = COALESCE((select l_id2 from nir.nir_links where l_id1=objid and l_id_link_type=1),0);
	END LOOP;
	isreader = rt>b'0';
	isworker = rt>b'1';
	iseditor = rt>b'11';
	isdirector = rt>b'111';
	isadmin = rt>b'1111';
	RETURN NEXT;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_access (OID = 218670) :
--
CREATE FUNCTION nir.get_access (
  object_id integer,
  user_id integer
)
RETURNS TABLE (
  isreader boolean,
  isworker boolean,
  iseditor boolean,
  isdirector boolean,
  isadmin boolean
)
AS
$body$
DECLARE
 rt bit varying;
 objid int;
 parid int;
 --user_id int;
--isreader boolean;
 --isworker boolean;
 --iseditor boolean;
 --isdirector boolean;
 --isadmin boolean;
BEGIN
--	user_id = COALESCE((select o_id from nir.full_users_view where user_id_system=current_user),0);
	objid=$1;
	rt = COALESCE((SELECT  roa_bit_map from nir.rights_access
		    where roa_id_object=objid and roa_id_subject = user_id), b'0');
	parid = COALESCE((select l_id2 from nir.nir_links where l_id1=objid and l_id_link_type=1),0);
	WHILE ( rt=b'0' AND parid>0 ) LOOP
		objid=parid;
		rt = COALESCE((SELECT  roa_bit_map from nir.rights_access
		    where roa_id_object=objid and roa_id_subject = user_id),b'0');
		parid = COALESCE((select l_id2 from nir.nir_links where l_id1=objid and l_id_link_type=1),0);
	END LOOP;
	isreader = rt>b'0';
	isworker = rt>b'1';
	iseditor = rt>b'11';
	isdirector = rt>b'111';
	isadmin = rt>b'1111';
	RETURN NEXT;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_access_group (OID = 218671) :
--
CREATE FUNCTION nir.get_access_group (
  object_id integer,
  user_id integer
)
RETURNS TABLE (
  isreader boolean,
  isworker boolean,
  iseditor boolean,
  isdirector boolean,
  isadmin boolean
)
AS
$body$
DECLARE
 rt bit varying;
 objid int;
 parid int;
 --user_id int;
--isreader boolean;
 --isworker boolean;
 --iseditor boolean;
 --isdirector boolean;
 --isadmin boolean;
BEGIN
--	user_id = COALESCE((select o_id from nir.full_users_view where user_id_system=current_user),0);
	objid=$1;
	rt = COALESCE((SELECT  rog_bit_map from nir.rights_of_groups
		    where rog_id_object=objid and rog_id_subject = user_id), b'0');
	parid = COALESCE((select l_id2 from nir.nir_links where l_id1=objid and l_id_link_type=1),0);
	WHILE ( rt=b'0' AND parid>0 ) LOOP
		objid=parid;
		rt = COALESCE((SELECT  rog_bit_map from nir.rights_of_groups
		    where rog_id_object=objid and rog_id_subject = user_id),b'0');
		parid = COALESCE((select l_id2 from nir.nir_links where l_id1=objid and l_id_link_type=1),0);
	END LOOP;
	isreader = rt>b'0';
	isworker = rt>b'1';
	iseditor = rt>b'11';
	isdirector = rt>b'111';
	isadmin = rt>b'1111';
	RETURN NEXT;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_access_mask (OID = 218672) :
--
CREATE FUNCTION nir.get_access_mask (
  object_id integer,
  user_id integer
)
RETURNS bit varying
AS
$body$
DECLARE
 rt bit varying;
 --objid int;
 --parid int;
 --user_id int;
isreader boolean;
 isworker boolean;
 iseditor boolean;
 isdirector boolean;
 isadmin boolean;
BEGIN
--	user_id = COALESCE((select o_id from nir.full_users_view where user_id_system=current_user),0);
	select * into isreader , isworker , iseditor , isdirector , isadmin  from nir.get_access($1,$2);
	rt = (select nir.boolean_to_bit( isreader , isworker , iseditor , isdirector , isadmin ));
	RETURN rt;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_access_mask_2 (OID = 218673) :
--
CREATE FUNCTION nir.get_access_mask_2 (
  object_id integer,
  user_id integer
)
RETURNS bit varying
AS
$body$
DECLARE
 rt bit varying;
 --objid int;
 --parid int;
 --user_id int;
isreader boolean;
 isworker boolean;
 iseditor boolean;
 isdirector boolean;
 isadmin boolean;
BEGIN
--	user_id = COALESCE((select o_id from nir.full_users_view where user_id_system=current_user),0);
	select * into isreader , isworker , iseditor , isdirector , isadmin  from nir.get_access($1,$2);
	rt = (select nir.boolean_to_bit_2( isreader , isworker , iseditor , isdirector , isadmin ));
	RETURN rt;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_access_mask_2_for_group (OID = 218674) :
--
CREATE FUNCTION nir.get_access_mask_2_for_group (
  object_id integer,
  user_id integer
)
RETURNS bit varying
AS
$body$
DECLARE
 rt bit varying;
 --objid int;
 --parid int;
 --user_id int;
isreader boolean;
 isworker boolean;
 iseditor boolean;
 isdirector boolean;
 isadmin boolean;
BEGIN
--	user_id = COALESCE((select o_id from nir.full_users_view where user_id_system=current_user),0);
	select * into isreader , isworker , iseditor , isdirector , isadmin  from nir.get_access_group($1,$2);
	rt = (select nir.boolean_to_bit_2( isreader , isworker , iseditor , isdirector , isadmin ));
	RETURN rt;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_all_templates_doc (OID = 218675) :
--
CREATE FUNCTION nir.get_all_templates_doc (
)
RETURNS TABLE (
  id integer,
  name text
)
AS
$body$
DECLARE
	--temp templates;
BEGIN
	FOR id, name IN SELECT o_id, o_name FROM nir.Nir_object WHERE o_id_type = 7 ORDER BY o_name
	LOOP
		RETURN NEXT ;
	END LOOP;
	RETURN;

	--list := (SELECT ARRAY(SELECT o_name FROM Nir_object WHERE o_id_type=11));
	--return list;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_all_templates_kz (OID = 218676) :
--
CREATE FUNCTION nir.get_all_templates_kz (
)
RETURNS TABLE (
  id integer,
  name character varying
)
AS
$body$
	SELECT o_id as id, o_name as name FROM nir.Nir_object WHERE o_id_type = 8 ORDER BY o_name
$body$
LANGUAGE sql;
--
-- Definition for function get_atrs_obj (OID = 218677) :
--
CREATE FUNCTION nir.get_atrs_obj (
  id integer
)
RETURNS TABLE (
  atr_id integer,
  atr_name text,
  atr_type smallint,
  atr_value text
)
AS
$body$
 select atr_id, atr_name, atr_type, atr_value from nir.atrs_view_2 where obj_id=$1 order by atr_name;
$body$
LANGUAGE sql;
--
-- Definition for function get_cat_of_catalog (OID = 218678) :
--
CREATE FUNCTION nir.get_cat_of_catalog (
  id_parent integer
)
RETURNS TABLE (
  id integer,
  name character varying
)
AS
$body$
	SELECT o_id as id, o_name as name
	FROM nir.Nir_object JOIN nir.Nir_links ON o_id=l_id1 WHERE l_id2=$1 AND l_id_link_type=1 AND o_id_type=4 ORDER BY o_name;
$body$
LANGUAGE sql;
--
-- Definition for function get_catalog (OID = 218679) :
--
CREATE FUNCTION nir.get_catalog (
  id integer
)
RETURNS text
AS
$body$
	SELECT o_name FROM nir.Nir_object WHERE o_id=$1 limit 1;
$body$
LANGUAGE sql;
--
-- Definition for function get_children_list (OID = 218680) :
--
CREATE FUNCTION nir.get_children_list (
  id_obj integer
)
RETURNS TABLE (
  n_children integer,
  children_id integer,
  parent_name text,
  parent_type integer,
  o_id integer,
  o_name text,
  o_id_type integer
)
AS
$body$
WITH recursive childrens AS
(
select 1 as n_children, l_id1 as children_id, l_id2 as obj_id
  FROM nir.nir_links where l_id2 =$1 and
	l_id_link_type=1
union all
 SELECT (n_children+1) as n_children, l_id1 as children_id, l_id2 as obj_id
  FROM  childrens left join nir.nir_links on children_id = l_id2
	where l_id_link_type=1
)
select n_children, children_id, c.o_name as children_name, c.o_id_type::int as children_type,
 o.o_id, o.o_name, o.o_id_type::int
from childrens left join nir.nir_object o on obj_id = o.o_id
	left join nir.nir_object c on children_id = c.o_id
where o.o_id_type=4 or o.o_id_type=5
order by n_children desc;
$body$
LANGUAGE sql;
--
-- Definition for function get_count_roles_for_api (OID = 218681) :
--
CREATE FUNCTION nir.get_count_roles_for_api (
)
RETURNS bigint
AS
$body$
	Select count(*) from nir.nir_role
$body$
LANGUAGE sql;
--
-- Definition for function get_curuser (OID = 218682) :
--
CREATE FUNCTION nir.get_curuser (
)
RETURNS text
AS
$body$
	SELECT current_user::text
$body$
LANGUAGE sql;
--
-- Definition for function get_db (OID = 218683) :
--
CREATE FUNCTION nir.get_db (
)
RETURNS TABLE (
  iddb integer,
  namedb text
)
AS
$body$
	SELECT o_id as iddb, o_name as namedb FROM nir.Nir_object WHERE o_id_type = 13 ORDER BY o_name
$body$
LANGUAGE sql;
--
-- Definition for function get_doc_name_by_id (OID = 218684) :
--
CREATE FUNCTION nir.get_doc_name_by_id (
  id_doc integer
)
RETURNS varchar
AS
$body$
DECLARE
	name_doc character varying;
BEGIN
	name_doc := (SELECT o_name FROM nir.Nir_object WHERE o_id=id_doc AND o_id_type = 5 limit 1);
	return name_doc;
END;

$body$
LANGUAGE plpgsql;
--
-- Definition for function get_docs_of_cat (OID = 218685) :
--
CREATE FUNCTION nir.get_docs_of_cat (
  id_catalog integer
)
RETURNS TABLE (
  id integer,
  name character varying
)
AS
$body$
	SELECT o_id as id, o_name as name
		FROM nir.Nir_object JOIN nir.Nir_links
		ON o_id=l_id1 WHERE l_id2=$1 AND l_id_link_type=1 AND o_id_type=5 ORDER BY o_name
$body$
LANGUAGE sql;
--
-- Definition for function get_file_name (OID = 218686) :
--
CREATE FUNCTION nir.get_file_name (
  id_file integer
)
RETURNS TABLE (
  idfile integer,
  namefile text
)
AS
$body$
	SELECT o_id as idfile, o_name as namefile FROM nir.Nir_object WHERE o_id=$1 LIMIT 1;
$body$
LANGUAGE sql;
--
-- Definition for function get_group_user_roles (OID = 218687) :
--
CREATE FUNCTION nir.get_group_user_roles (
  rolename text,
  username text = "current_user"()
)
RETURNS TABLE (
  group_id integer,
  gr_sys_name character varying
)
AS
$body$
SELECT group_id, gr_sys_name  FROM nir.group_user_view where user_id_system=$2 and gr_sys_name in
( select gr_sys_name from nir.group_role_view where r_name=$1);
$body$
LANGUAGE sql;
--
-- Definition for function get_id_curuser (OID = 218688) :
--
CREATE FUNCTION nir.get_id_curuser (
)
RETURNS integer
AS
$body$
DECLARE
 did integer;
BEGIN
	SELECT o_id  into did FROM nir.full_users_view where user_id_system=current_user;
	return COALESCE(did,0);
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_id_name_group (OID = 218689) :
--
CREATE FUNCTION nir.get_id_name_group (
)
RETURNS TABLE (
  id integer,
  name text
)
AS
$body$
	select group_id, group_name from nir.nir_group
$body$
LANGUAGE sql;
--
-- Definition for function get_id_top (OID = 218690) :
--
CREATE FUNCTION nir.get_id_top (
  id_obj integer
)
RETURNS integer
AS
$body$
WITH recursive parents AS
(

select 1 as n_parent, o_id as parent_id from nir.nir_object
	where ( o_id=$1 and o_id_type in (13,1) ) or
		( o_id in (select l_id2 FROM nir.nir_links where l_id1 =$1 and	l_id_link_type=1 ) )
union all
 SELECT (n_parent+1) as n_parent, l_id2 as parent_id
  FROM  parents left join nir.nir_links on parent_id = l_id1
	where l_id_link_type=1
)
select parent_id
from parents left join nir.nir_object p on parent_id = p.o_id
order by n_parent desc limit 1;
$body$
LANGUAGE sql;
--
-- Definition for function get_kz (OID = 218691) :
--
CREATE FUNCTION nir.get_kz (
  user_id integer
)
RETURNS TABLE (
  idkz integer,
  namekz text
)
AS
$body$
	SELECT o_id as idkz, o_name as namekz FROM nir.Nir_object JOIN nir.nir_links ON l_id1=o_id WHERE l_id2=$1 AND l_id_link_type=9 AND o_id_type = 1
$body$
LANGUAGE sql;
--
-- Definition for function get_my_templates_doc (OID = 218692) :
--
CREATE FUNCTION nir.get_my_templates_doc (
)
RETURNS TABLE (
  id integer,
  name text
)
AS
$body$
DECLARE
	--temp templates;
BEGIN
	FOR id, name IN SELECT o_id, o_name FROM nir.Nir_object WHERE o_id_type = 7
		and exists( select l_id from nir.nir_links where l_id1=o_id and l_id2=nir.get_id_curuser() )
		ORDER BY o_name
	LOOP
		RETURN NEXT;
	END LOOP;
	RETURN;

	--list := (SELECT ARRAY(SELECT o_name FROM Nir_object WHERE o_id_type=11));
	--return list;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_objs_in_catalog (OID = 218693) :
--
CREATE FUNCTION nir.get_objs_in_catalog (
  id_catalog integer
)
RETURNS TABLE (
  parent_id integer,
  o_id integer,
  o_name text,
  o_id_type smallint
)
AS
$body$
WITH recursive parents AS
(
select l_id2 as parent_id, l_id1 as obj_id
  FROM nir.nir_links where l_id2 =$1
	and l_id_link_type=1
union all
 SELECT l_id2 as parent_id, l_id1 as obj_id
  FROM  parents left join nir.nir_links on obj_id = l_id2
	where l_id_link_type=1
)
select parent_id, o_id, o_name, o_id_type
from parents left join nir.nir_object on obj_id = o_id
where o_id_type=4 or o_id_type=5;
$body$
LANGUAGE sql;
--
-- Definition for function get_parent_catalog (OID = 218694) :
--
CREATE FUNCTION nir.get_parent_catalog (
  id integer
)
RETURNS TABLE (
  id integer,
  name text,
  type smallint
)
AS
$body$
	select parent_id as id, parent_name as name, parent_id_type as type from nir.nir_parent_view
	where obj_id=$1
$body$
LANGUAGE sql;
--
-- Definition for function get_parent_catalog_comfortable (OID = 218695) :
--
CREATE FUNCTION nir.get_parent_catalog_comfortable (
  id integer
)
RETURNS TABLE (
  id integer
)
AS
$body$

SELECT obj.l_id2 AS obj_id
   FROM ( SELECT a.o_id, a.o_name, a.o_id_type, b.l_id2
           FROM nir.nir_object a
      JOIN nir.nir_links b ON a.o_id = b.l_id1
     WHERE (a.o_id_type = ANY (ARRAY[4, 5]) AND a.o_id=$1 ) AND b.l_id_link_type = 1::smallint) obj
   JOIN nir.nir_object par ON obj.l_id2 = par.o_id


$body$
LANGUAGE sql;
--
-- Definition for function get_parent_path (OID = 218696) :
--
CREATE FUNCTION nir.get_parent_path (
  id integer
)
RETURNS text
AS
$body$
 select array_to_string( ARRAY(
	SELECT (parent_id::text || ':'|| parent_type::text || ':' || parent_name) from nir.get_parents_list( $1 )),
 ';;'::text);
$body$
LANGUAGE sql;
--
-- Definition for function get_parents_list (OID = 218697) :
--
CREATE FUNCTION nir.get_parents_list (
  id_obj integer
)
RETURNS TABLE (
  n_parent integer,
  parent_id integer,
  parent_name text,
  parent_type integer,
  o_id integer,
  o_name text,
  o_id_type integer
)
AS
$body$
WITH recursive parents AS
(
select 1 as n_parent, l_id2 as parent_id, l_id1 as obj_id
  FROM nir.nir_links where l_id1 =$1 and
	l_id_link_type=1
union all
 SELECT (n_parent+1) as n_parent, l_id2 as parent_id, l_id1 as obj_id
  FROM  parents left join nir.nir_links on parent_id = l_id1
	where l_id_link_type=1
)
select n_parent, parent_id, p.o_name as parent_name, p.o_id_type::int as parent_type,
 o.o_id, o.o_name, o.o_id_type::int
from parents left join nir.nir_object o on obj_id = o.o_id
	left join nir.nir_object p on parent_id = p.o_id
where o.o_id_type=4 or o.o_id_type=5
order by n_parent desc;
$body$
LANGUAGE sql;
--
-- Definition for function get_rigths (OID = 218698) :
--
CREATE FUNCTION nir.get_rigths (
  object_id integer,
  subject_id integer
)
RETURNS TABLE (
  isadmin boolean,
  iseditor boolean,
  isworker boolean,
  isreader boolean
)
AS
$body$
begin
	return query SELECT u.isadmin, u.iseditor, u.isworker, u.isreader  FROM nir.full_users_view u where o_id=$2;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_role_list_for_api (OID = 218699) :
--
CREATE FUNCTION nir.get_role_list_for_api (
)
RETURNS TABLE (
  r_name character varying,
  r_info character varying,
  r_desc character varying,
  r_parent character varying
)
AS
$body$
 SELECT r.r_name, r.r_info, r.r_desc, p.r_name
  FROM nir.nir_role r left join nir.nir_role p on r.r_parent = p.r_id;

$body$
LANGUAGE sql;
--
-- Definition for function get_roles_by_user_list_for_api (OID = 218700) :
--
CREATE FUNCTION nir.get_roles_by_user_list_for_api (
)
RETURNS TABLE (
  r_name character varying
)
AS
$body$
 select r_name from nir.user_role_view where user_id_system='xgb_nir';
$body$
LANGUAGE sql;
--
-- Definition for function get_roles_by_user_list_for_api (OID = 218701) :
--
CREATE FUNCTION nir.get_roles_by_user_list_for_api (
  name_of_user character varying
)
RETURNS TABLE (
  r_id integer,
  r_name character varying
)
AS
$body$
 select nir.nir_user_role.role_id, nir.nir_role.r_name
 from nir.nir_user_role, nir.nir_user, nir.nir_role
 where nir.nir_user.user_name=$1 AND nir.nir_user.user_id = nir.nir_user_role.user_id AND nir.nir_role.r_id = nir.nir_user_role.role_id;
$body$
LANGUAGE sql;
--
-- Definition for function get_tags_obj (OID = 218702) :
--
CREATE FUNCTION nir.get_tags_obj (
  id integer
)
RETURNS TABLE (
  tag_id integer,
  tag_name character varying
)
AS
$body$
 select tag_id, tag_name from nir.tags_view where obj_id=$1 order by tag_name;
$body$
LANGUAGE sql;
--
-- Definition for function get_teg_by_id (OID = 218703) :
--
CREATE FUNCTION nir.get_teg_by_id (
  idd integer
)
RETURNS varchar
AS
$body$
	SELECT o_name FROM nir.Nir_object WHERE o_id = idd limit 1;
$body$
LANGUAGE sql;
--
-- Definition for function get_top_type (OID = 218704) :
--
CREATE FUNCTION nir.get_top_type (
  id_obj integer
)
RETURNS smallint
AS
$body$
	select o_id_type as id_type from nir.nir_object where o_id=nir.get_id_top($1) limit 1;
$body$
LANGUAGE sql;
--
-- Definition for function get_user_kz (OID = 218705) :
--
CREATE FUNCTION nir.get_user_kz (
  user_id integer
)
RETURNS TABLE (
  id integer,
  name character varying
)
AS
$body$
 SELECT o_id as id, o_name as name
	FROM nir.Nir_object JOIN nir.Nir_links ON o_id=l_id1 WHERE l_id2=$1 AND l_id_link_type=9 ORDER BY o_name
$body$
LANGUAGE sql;
--
-- Definition for function get_user_roles (OID = 218706) :
--
CREATE FUNCTION nir.get_user_roles (
  username text
)
RETURNS TABLE (
  r_id integer,
  r_name character varying,
  own boolean
)
AS
$body$
select r_id, r_name, (exists(select * from nir.nir_user_role where role_id=r_id and user_id = (select user_id from nir.nir_user where user_id_system = $1))) as own
 from nir.nir_role where ( r_id in (select role_id from nir.nir_user_role where user_id = (select user_id from nir.nir_user where user_id_system = $1) ) )
 or ( r_id in (select role_id from nir.nir_group_role where group_id in (SELECT group_id FROM nir.group_user_view where user_id_system=$1 ) ) )
$body$
LANGUAGE sql;
--
-- Definition for function get_users_role_list_for_api (OID = 218707) :
--
CREATE FUNCTION nir.get_users_role_list_for_api (
  id integer
)
RETURNS TABLE (
  user_id integer,
  user_name character varying,
  r_name character varying,
  r_info character varying,
  r_desc character varying
)
AS
$body$
 SELECT nir.nir_user.user_id, nir.nir_user.user_name, r_name, r_info, r_desc
	FROM nir.Nir_role, nir.Nir_user, nir.Nir_user_role
	WHERE nir.Nir_user_role.user_id = $1 AND nir.Nir_role.r_id =  nir.Nir_user_role.role_id AND nir.Nir_user.user_id = nir.Nir_user_role.user_id
$body$
LANGUAGE sql;
--
-- Definition for function getattrlist (OID = 218708) :
--
CREATE FUNCTION nir.getattrlist (
)
RETURNS TABLE (
  id integer,
  name character varying,
  type smallint
)
AS
$body$
 SELECT o_id as id, o_name as name, l_type_attr_id as type
	FROM nir.Nir_object JOIN nir.Nir_links ON o_id=l_id1 WHERE o_id_type = 6 AND l_id_link_type=8 ORDER BY o_name
$body$
LANGUAGE sql;
--
-- Definition for function getgroupbyid (OID = 218709) :
--
CREATE FUNCTION nir.getgroupbyid (
  group_id integer
)
RETURNS varchar
AS
$body$
select group_name FROM nir.Nir_group where group_id = group_id;
$body$
LANGUAGE sql;
--
-- Definition for function add_profile (OID = 218710) :
--
CREATE FUNCTION nir.add_profile (
  namess text,
  user_id integer = nir.get_id_curuser()
)
RETURNS integer
AS
$body$
DECLARE
	id integer;
BEGIN
	if namess='' then
		namess='Профиль пользователя '|| COALESCE( (select o_name from nir.full_users_view WHERE o_id=$2),'');
	end if;
  	if not exists( SELECT o_id_1 FROM nir.links_view WHERE o_id_2 = user_id and o_type_1=18 and l_id_link_type = 9 ) then
		insert into nir.nir_object (o_name,o_id_type) values (namess,18) returning o_id into id;
		INSERT INTO nir.nir_links (l_id1, l_id2, l_id_link_type ) VALUES (id, user_id, 9);
	end if;
	id = COALESCE( (SELECT o_id_1 FROM nir.links_view WHERE o_id_2 = user_id and o_type_1=18 and l_id_link_type = 9), 0);
	return id;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function clear_atrs_profile (OID = 218711) :
--
CREATE FUNCTION nir.clear_atrs_profile (
  iduser integer = nir.get_id_curuser()
)
RETURNS integer
AS
$body$
begin
	delete from nir.Nir_links WHERE l_id1 in ( select profile_id from nir.user_profile_view where user_id=iduser )  AND l_id2 in
		(select o_id from nir.Nir_object  where o_id_type=6) ;
	return 1;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function getroles_access (OID = 218712) :
--
CREATE FUNCTION nir.getroles_access (
  object_id integer
)
RETURNS TABLE (
  r_id integer,
  r_name text,
  r_info text,
  r_code bit varying
)
AS
$body$
DECLARE
	--role roletype;
BEGIN
	FOR r_id, r_name, r_info, r_code
		IN SELECT  role_access_id, role_access_name, role_access_desc, role_access_mask from nir.role_access_real
		where role_access_id_object_type = (select o_id_type from nir.nir_object where o_id=$1)
	LOOP
		RETURN NEXT ;
	END LOOP;
	RETURN;

END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function gettaglist (OID = 218713) :
--
CREATE FUNCTION nir.gettaglist (
)
RETURNS TABLE (
  id integer,
  name character varying
)
AS
$body$
select o_id as id, o_name as name FROM nir.Nir_object WHERE o_id_type = 11 order by o_name
$body$
LANGUAGE sql;
--
-- Definition for function getuserrole (OID = 218714) :
--
CREATE FUNCTION nir.getuserrole (
)
RETURNS TABLE (
  user_role_id character varying,
  user_id integer,
  role_id bit varying
)
AS
$body$


 SELECT r_info, user_id_object, r_code
FROM nir.nir_user_role, nir.nir_user, nir.nir_role
where nir.nir_user.user_id = nir.nir_user_role.user_id and nir.nir_role.r_id = nir.nir_user_role.role_id

$body$
LANGUAGE sql;
--
-- Definition for function getusers (OID = 218715) :
--
CREATE FUNCTION nir.getusers (
)
RETURNS TABLE (
  user_id integer,
  user_name character varying,
  user_id_system character varying,
  user_id_object integer
)
AS
$body$
select user_id,user_name,user_id_system,user_id_object FROM nir.Nir_User;
$body$
LANGUAGE sql;
--
-- Definition for function getusersbyid (OID = 218716) :
--
CREATE FUNCTION nir.getusersbyid (
  us_id_obj integer
)
RETURNS TABLE (
  user_id integer,
  user_name character varying,
  user_id_system character varying,
  user_id_object integer
)
AS
$body$
select user_id,user_name,user_id_system,user_id_object FROM nir.Nir_User where user_id_object=$1;
$body$
LANGUAGE sql;
--
-- Definition for function great_then (OID = 218717) :
--
CREATE FUNCTION nir.great_then (
  atype smallint,
  aval text,
  val text
)
RETURNS boolean
AS
$body$
DECLARE  r boolean;
begin
	case
	when atype=1 then r = ( cast(aval as int) > cast(val as int) );
	when atype=2 then r = ( upper(aval) > upper(val) );
	when atype=3 then
		if( upper(val) = 'NOW' ) then
			r = ( cast(aval as timestamp) > now() );
		else
			r = ( cast(aval as timestamp) > cast(val as timestamp) );
		end if;
	end case;
	return r;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function is_between_value (OID = 218718) :
--
CREATE FUNCTION nir.is_between_value (
  atype smallint,
  aval text,
  val1 text,
  val2 text
)
RETURNS boolean
AS
$body$
DECLARE  r boolean;
begin
	case
	when atype=1 then r = ( cast(aval as int) between cast(val1 as int) and cast(val2 as int) ) ;
	when atype=2 then r = ( upper(aval) between upper(val1) and upper(val2) ) ;
	when atype=3 then r = ( cast(aval as timestamp) between  cast(val1 as timestamp) and cast(val2 as timestamp) );
	end case;
	return r;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function is_equal_value (OID = 218719) :
--
CREATE FUNCTION nir.is_equal_value (
  atype smallint,
  aval text,
  val text
)
RETURNS boolean
AS
$body$
DECLARE  r boolean;
begin
	case
	when atype=1 then r = ( cast(aval as int) = cast(val as int) );
	when atype=2 then r = ( upper(aval) = upper(val) );
	when atype=3 then r = ( cast(aval as timestamp) = cast(val as timestamp) );
	end case;
	return r;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function isowner (OID = 218720) :
--
CREATE FUNCTION nir.isowner (
  obj integer,
  own integer
)
RETURNS boolean
AS
$body$
DECLARE  r boolean;
begin
	return (SELECT exists ( select l_id from nir.nir_links where l_id1=obj and l_id2=own and l_id_link_type=9));
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function just_for_test (OID = 218721) :
--
CREATE FUNCTION nir.just_for_test (
)
RETURNS integer
AS
$body$DECLARE
	id_module integer;

BEGIN
	id_module = 0;
	return id_module;
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function less_then (OID = 218722) :
--
CREATE FUNCTION nir.less_then (
  atype smallint,
  aval text,
  val text
)
RETURNS boolean
AS
$body$
DECLARE  r boolean;
begin
	case
	when atype=1 then r = ( cast(aval as int) < cast(val as int) );
	when atype=2 then r = ( upper(aval) < upper(val) );
	when atype=3 then
		if( upper(val) = 'NOW' ) then
			r = ( cast(aval as timestamp) < now() );
		else
			r = ( cast(aval as timestamp) < cast(val as timestamp) );
		end if;
	end case;
	return r;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function link_group_to_role (OID = 218723) :
--
CREATE FUNCTION nir.link_group_to_role (
  groupname character varying,
  rolename character varying
)
RETURNS integer
AS
$body$

BEGIN
    if not exists(select r_id from nir.nir_role where r_name = rolename) then
    return -1;
    end if;
    if not exists (select group_id from nir.nir_group where gr_sys_name = groupname ) then
    return -2;
    end if;
    if exists (select group_id from nir.nir_group_role where role_id = (select r_id from nir.nir_role where r_name = rolename)
	and group_id=(select group_id from nir.nir_group where gr_sys_name = groupname ) ) then
    return -3;
    end if;


--execute 'GRANT '|| quote_ident($2) || ' TO ' || quote_ident($1);
    INSERT INTO nir.nir_group_role (group_id, role_id)
    VALUES ((SELECT group_id FROM nir.nir_group WHERE gr_sys_name = groupname), (SELECT r_id FROM nir.nir_role WHERE r_name = rolename));

    return 1;
END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function link_user_to_role (OID = 218724) :
--
CREATE FUNCTION nir.link_user_to_role (
  username character varying,
  rolename character varying
)
RETURNS integer
AS
$body$

BEGIN
    if not exists(select r_id from nir.nir_role where r_name = rolename) then
    return -1;
    end if;
    if not exists(select user_id from nir.nir_user where user_id_system = username) then
    return -2;
    end if;
    if exists (select user_id from nir.nir_user_role where user_id = (SELECT user_id FROM nir.nir_user WHERE user_id_system = username)
	and role_id = (SELECT r_id FROM nir.nir_role WHERE r_name = rolename)) then
    return -3;
    end if;

    --execute 'GRANT '|| $2 || ' TO ' || $1;
    INSERT INTO nir.nir_user_role (user_id, role_id)
    VALUES ((SELECT user_id FROM nir.nir_user WHERE user_id_system = username), (SELECT r_id FROM nir.nir_role WHERE r_name = rolename));

    return 1;
END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function loadfile (OID = 218725) :
--
CREATE FUNCTION nir.loadfile (
  namess character varying,
  iddoc integer
)
RETURNS integer
AS
$body$
DECLARE
	idfile int;
begin
	if not exists(SELECT o_id FROM nir.Nir_object JOIN nir.Nir_links
		ON l_id1=o_id WHERE l_id2=iddoc AND o_id_type=12 AND o_name = namess AND l_id_link_type=10) then

		INSERT INTO nir.Nir_object (o_name, o_id_type) VALUES (namess, 12) returning o_id into idfile;
		if idfile is not null then
			INSERT INTO nir.Nir_links (l_id2, l_id1, l_id_link_type) VALUES (iddoc, idfile, 10);
			return idfile; --добавление прошло успешно
		else
			return 0; --не удалось создать файл
		end if;
	else
		return -1; --у дока уже есть связь с файлом такого имени
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function nir_kz_tags (OID = 218726) :
--
CREATE FUNCTION nir.nir_kz_tags (
  id_o integer,
  tags text[]
)
RETURNS TABLE (
  cat_id integer,
  obj_name character varying,
  obj_type_id smallint,
  obj_tags text
)
AS
$body$
	DECLARE
		tag text;
		arr_len integer;
		n integer;
		i integer;
		obj_arr integer[];
		obj_len integer;
		counter integer;
		fl integer;
		arr varchar[];
	BEGIN
	n:=1;
arr_len:=array_length(tags, 1);

  CREATE TEMP TABLE temp_table  AS(SELECT ct.obj_id as obj_id FROM (SELECT COUNT(a.tag_name) as count, a.obj_id FROM (SELECT
    t.o_name AS tag_name,
    o.o_id AS obj_id
    FROM nir.Nir_object o,
    nir.Nir_links,
    nir.Nir_object t
  WHERE Nir_links.l_id1 = o.o_id AND Nir_links.l_id2 = t.o_id AND Nir_links.l_id_link_type = 4 ) as a
  GROUP BY a.obj_id) as ct WHERE ct.count >= "arr_len") ;

  CREATE TEMP TABLE temp_table1  AS(SELECT
    t.o_name AS tag_name,
    o.o_id AS obj_id
    FROM nir.Nir_object o,
    nir.Nir_links,
    nir.Nir_object t
  WHERE Nir_links.l_id1 = o.o_id AND Nir_links.l_id2 = t.o_id AND Nir_links.l_id_link_type = 4 AND o.o_id IN (SELECT c.obj_id FROM temp_table as C));
      CREATE TEMP TABLE tmp as TABLE temp_table1 ;
  WHILE (n <= arr_len) LOOP
  tag:=tags[n];
        if (tag IN (SELECT c.tag_name FROM temp_table1 as C))
        THEN INSERT INTO tmp SELECT DISTINCT tmp1.tag_name, tmp1.obj_id  FROM temp_table1 as tmp1 WHERE tmp1.tag_name = tag;
         END IF;
         n:=n+1;
         END LOOP;
       obj_arr:=ARRAY(SELECT DISTINCT tmp.obj_id FROM tmp);
       i:=0;
        CREATE TEMP TABLE result(obj_id integer);
    for i IN 1..coalesce(array_length(obj_arr, 1))
    LOOP
    counter:=0;
		for counter IN 1..coalesce(array_length(tags, 1))
		LOOP
		if (tags[counter] NOT IN (SELECT c.tag_name FROM temp_table1 as c WHERE c.obj_id=obj_arr[i]))
		      THEN fl:=0;
		      ELSE fl:=1;
		END IF ;
		exit when fl=0;
		END LOOP;
		if (fl=1) THEN INSERT INTO result VALUES(obj_arr[i]);
		END IF;

    END LOOP;
   return QUERY  SELECT PAR.o_id as cat_id, OBJ.o_name as obj_name, OBJ.o_id_type as obj_type, string_agg(tag.name, ',') FROM

     (SELECT o_id, o_name, o_id_type, l_id2 FROM nir.Nir_object AS A JOIN nir.Nir_links as B ON A.o_id=B.l_id1
                WHERE o_id_type IN (4,5) AND l_id_link_type = '1' AND l_id2=id_o AND o_id IN(SELECT * FROM result)) as OBJ JOIN nir.Nir_object as PAR ON OBJ.l_id2=PAR.o_id JOIN (SELECT
    t.o_name AS name,
    o.o_id AS obj_id
    FROM nir.Nir_object o,
    nir.Nir_links,
    nir.Nir_object t
  WHERE Nir_links.l_id1 = o.o_id AND Nir_links.l_id2 = t.o_id AND Nir_links.l_id_link_type = 4) as tag ON tag.obj_id=obj.o_id
  GROUP BY PAR.o_id, OBJ.o_name, OBJ.o_id_type;

     DROP TABLE temp_table1, temp_table, tmp, result;
   END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function rename_group (OID = 218727) :
--
CREATE FUNCTION nir.rename_group (
  oldname character varying,
  newname character varying
)
RETURNS integer
AS
$body$
BEGIN
    if (upper(oldname) in( SELECT upper(r_name) FROM nir.nir_role)) then
	return -2;
    end if;
    if (upper(newname) in( SELECT upper(r_name) FROM nir.nir_role) ) then
	return -3;
	end if;
    if not exists(select gr_sys_name from nir.nir_group where gr_sys_name = oldname) then
	return -1;
    end if;

    UPDATE nir.nir_group SET gr_sys_name = newname WHERE gr_sys_name = oldname;
    UPDATE nir.nir_object SET o_name = newname WHERE o_name = oldname AND o_id_type = 14;
    --execute 'ALTER GROUP ' || quote_ident($1) ' RENAME GROUP ' || quote_ident($2);
    return 1;

END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function rename_user (OID = 218728) :
--
CREATE FUNCTION nir.rename_user (
  oldname character varying,
  newname character varying
)
RETURNS integer
AS
$body$

BEGIN
    if (upper(oldname) in( SELECT upper(r_name) FROM nir.nir_role)) then
	return -2;
end if;
    if (upper(newname) in( SELECT upper(r_name) FROM nir.nir_role)) then
	return -3;
end if;
    if not exists(select user_id_system from nir.nir_user where user_id_system = oldname) then
    return -1;
    end if;
   -- execute 'ALTER USER ' || quote_ident($1) ' RENAME TO ' || quote_ident($2);
    UPDATE nir.nir_user SET user_id_system = newname WHERE user_id_system = oldname;
    UPDATE nir.nir_object SET o_name = newname WHERE o_name = oldname AND o_id_type = 2;
    return 1;

END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function search_tags_by_name (OID = 218729) :
--
CREATE FUNCTION nir.search_tags_by_name (
  search_name character varying
)
RETURNS TABLE (
  id integer,
  name character varying
)
AS
$body$
	select o_id as id, o_name as name FROM nir.Nir_object WHERE o_id_type = 11 AND UPPER(o_name) LIKE UPPER('%'||$1||'%') order by o_name
$body$
LANGUAGE sql;
--
-- Definition for function searchdocbyname (OID = 218730) :
--
CREATE FUNCTION nir.searchdocbyname (
  namess character varying
)
RETURNS char
AS
$body$
 --DECLARE objec varchar;
DECLARE
	id_doc integer;
	tagMass character varying[];
	--atrMass character[];
	--atrValues character[];

begin
	id_doc :=(SELECT o_id FROM nir.Nir_object WHERE o_name = namess);
	tagMass :=(SELECT ARRAY(SELECT o_name FROM nir.Nir_object JOIN nir.Nir_links ON o_id = l_id2 WHERE l_id1 = id_doc AND l_id_link_type = 4));
	return tagMass;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function set_access (OID = 218731) :
--
CREATE FUNCTION nir.set_access (
  object_id integer,
  user_id integer,
  mask bit varying
)
RETURNS bit varying
AS
$body$
DECLARE
 rt bit varying;
BEGIN
--	user_id = COALESCE((select o_id from nir.full_users_view where user_id_system=current_user),0);
	rt = (select nir.get_access_mask($1,$2));
	if( rt=mask) then
		return mask;
	else
		if not exists(SELECT roa_id_subject, roa_id_object from nir.rights_access where roa_id_object = $1 AND roa_id_subject = $2) then
			insert into nir.rights_access(roa_id_object, roa_id_subject, roa_bit_map) values($1,$2,$3);
		ELSE
			UPDATE nir.rights_access set roa_bit_map =$3 where roa_id_object = $1 AND roa_id_subject = $2;
		END IF;
	end if;
	RETURN mask;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function set_atrs_profile (OID = 218732) :
--
CREATE FUNCTION nir.set_atrs_profile (
  atr atrtype[] = ARRAY[]::nir.atrtype[],
  user_id integer = nir.get_id_curuser()
)
RETURNS integer
AS
$body$
DECLARE
	pid integer;
	atrOld text[];
	atrWork text[];
begin
	pid = nir.add_profile('',user_id);

	SELECT array_agg(atr_name) into atrOld from nir.get_atrs_obj(pid);

	select array_agg(v.a) into atrWork from
		( (select a from UNNEST( atrOld) a) except (select a.aname from UNNEST(atr) a) ) v;
	perform nir.del_atrs_from_obj(pid,atrWork);

	perform nir.add_atrs_to_obj(pid,atr);
	return pid;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function set_owner (OID = 218733) :
--
CREATE FUNCTION nir.set_owner (
  obj_id integer,
  user_id integer = nir.get_id_curuser()
)
RETURNS integer
AS
$body$
 DECLARE
	lid int;
begin
	if( exists( select l_id from nir.nir_links where l_id1=obj_id and l_id_link_type=9) ) then
		update nir.Nir_links set l_id2 =user_id where l_id1=obj_id and l_id_link_type=9 returning l_id into lid;
	else
		INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type) VALUES (obj_id, user_id, 9) returning l_id into lid;
	end if;
	return COALESCE(lid,0);
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function set_tema (OID = 218734) :
--
CREATE FUNCTION nir.set_tema (
  obj_id integer,
  user_id integer = nir.get_id_curuser()
)
RETURNS integer
AS
$body$
 DECLARE
	pid int;
	lid int;
begin
	pid = nir.add_profile('', user_id);
	if( exists(select o_id from nir.nir_object where o_id=obj_id and o_id_type=17) ) then
		lid = COALESCE( (SELECT o_id_1 FROM nir.links_view WHERE o_id_2 = pid and o_type_2=18 and o_id_1=17), 0 );
		if( lid>0 ) then
			update nir.Nir_links set l_id1 =obj_id where l_id =lid;
		else
			INSERT INTO nir.Nir_links (l_id1, l_id2, l_id_link_type) VALUES (obj_id, pid, 6) returning l_id into lid;
		end if;
		return COALESCE(lid,0);
	else
		return -1;
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function setrightsofgrouptoobj (OID = 218735) :
--
CREATE FUNCTION nir.setrightsofgrouptoobj (
  mass rightsss_of_access[]
)
RETURNS integer
AS
$body$
DECLARE
	--id_parent integer;
	count integer;
	massive nir.rightsss_of_access;
	old_mask bit varying;
begin
	count = 0;
	FOR i in 1..array_length(mass,1)
	LOOP
		massive := mass[i];
		old_mask = (SELECT nir.get_access_mask_2_for_group(massive.idobject,massive.idsubject));
		if( old_mask <> massive.mask) then
			if not exists(SELECT rog_id_subject, rog_id_object from nir.rights_of_groups where rog_id_object = massive.idobject AND rog_id_subject = massive.idsubject) then
			insert into nir.rights_of_groups(rog_id_object, rog_id_subject, rog_bit_map) values(massive.idobject, massive.idsubject , massive.mask);
			ELSE
			UPDATE nir.rights_of_groups set rog_bit_map =massive.mask where rog_id_object = massive.idobject AND rog_id_subject = massive.idsubject;
			END IF;
		end if;
		count = count+1;
	END LOOP;
	return count;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function setrightsofusertoobj (OID = 218736) :
--
CREATE FUNCTION nir.setrightsofusertoobj (
  mass rightsss_of_access[]
)
RETURNS integer
AS
$body$
DECLARE
	--id_parent integer;
	count integer;
	massive nir.rightsss_of_access;
	old_mask bit varying;
begin
	count = 0;
	FOR i in 1..array_length(mass,1)
	LOOP
		massive := mass[i];
		old_mask = (SELECT nir.get_access_mask_2(massive.idobject,massive.idsubject));
		if( old_mask <> massive.mask) then
			if not exists(SELECT roa_id_subject, roa_id_object from nir.rights_access where roa_id_object = massive.idobject AND roa_id_subject = massive.idsubject) then
			insert into nir.rights_access(roa_id_object, roa_id_subject, roa_bit_map) values(massive.idobject, massive.idsubject , massive.mask);
			ELSE
			UPDATE nir.rights_access set roa_bit_map =massive.mask where roa_id_object = massive.idobject AND roa_id_subject = massive.idsubject;
			END IF;
		end if;
		count = count+1;
	END LOOP;
	return count;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function showrights (OID = 218737) :
--
CREATE FUNCTION nir.showrights (
  object_id integer
)
RETURNS TABLE (
  l_id integer
)
AS
$body$

	select l_id1 from nir.Nir_links where l_id2 = $1;

$body$
LANGUAGE sql;
--
-- Definition for function tree_view (OID = 218738) :
--
CREATE FUNCTION nir.tree_view (
  obj_id integer
)
RETURNS TABLE (
  object_id integer,
  par_id integer,
  name character varying,
  level integer
)
AS
$body$
  begin
  RETURN QUERY WITH RECURSIVE tree AS(
	SELECT par_list.o_id, par_list.l_id2 as parent_id, par_list.o_name, 1 as level
	FROM (SELECT a.o_id as o_id, a.o_name, a.o_id_type, b.l_id2 FROM nir.Nir_object AS A JOIN nir.Nir_links as B
	ON A.o_id=B.l_id1
                WHERE l_id_link_type = '1' ) as par_list
	WHERE par_list.o_id = obj_id

	UNION ALL

	SELECT o.o_id, o.l_id2, o.o_name, tree.level + 1 AS level
	FROM (SELECT a.o_id, a.o_name, a.o_id_type, b.l_id2 FROM nir.Nir_object AS A JOIN nir.Nir_links as B
	 ON A.o_id=B.l_id1
                WHERE  l_id_link_type = '1' ) as O
			JOIN tree ON o.l_id2 = tree.o_id)
  SELECT * FROm tree;



 END;
 $body$
LANGUAGE plpgsql;
--
-- Definition for function unlink_group_from_role (OID = 218739) :
--
CREATE FUNCTION nir.unlink_group_from_role (
  groupname character varying,
  rolename character varying
)
RETURNS integer
AS
$body$
DECLARE
BEGIN
    if not exists(select r_id from nir.nir_role where r_name = rolename) then
    return -1;
    end if;
    if not exists(select gr_sys_name from nir.nir_group where gr_sys_name = groupname) then
    return -2;
    end if;
    if not exists (select group_id from nir.nir_group_role where role_id = (SELECT r_id FROM nir.nir_role WHERE r_name = rolename)
	and group_id=(select group_id from nir.nir_group where gr_sys_name = groupname )) then
    return -3;
    end if;
    --execute 'REVOKE ' || quote_ident(groupname)|| ' FROM ' || quote_ident(rolename);
    DELETE FROM nir.nir_group_role WHERE role_id = (SELECT r_id FROM nir.nir_role WHERE r_name = rolename) and group_id=(select group_id from nir.nir_group where gr_sys_name = groupname );
    return 1;
END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function unlink_user_from_role (OID = 218740) :
--
CREATE FUNCTION nir.unlink_user_from_role (
  username character varying,
  rolename character varying
)
RETURNS integer
AS
$body$
DECLARE
BEGIN
	if not exists(select r_id from nir.nir_role where r_name = rolename) then
    return -1;
    end if;
    if not exists(select user_id from nir.nir_user where user_id_system = username) then
    return -2;
    end if;
    if not exists (select user_id from nir.nir_user_role where user_id = (SELECT user_id FROM nir.nir_user WHERE user_id_system = username)
	and role_id = (SELECT r_id FROM nir.nir_role WHERE r_name = rolename)) then
    return -3;
    end if;
    --execute 'REVOKE ' || quote_ident(rolename)|| ' FROM ' || quote_ident(username);
    DELETE FROM nir.nir_user_role WHERE user_id = (SELECT user_id FROM nir.nir_user WHERE user_id_system = username)
	and role_id = (SELECT r_id FROM nir.nir_role WHERE r_name = rolename);
    return 1;
END;
   $body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_doc_date (OID = 218741) :
--
SET search_path = public, pg_catalog;
CREATE FUNCTION public.add_attr_to_doc_date (
  name character varying,
  value date,
  doc_id integer
)
RETURNS integer
AS
$body$
DECLARE
	id_attr integer;
	id_attr_mass integer[];
	id_link integer;
	i integer;
	namess character varying;
BEGIN
	--проверка, нет ли атрибута с таким же именем у документа
	id_attr_mass := (SELECT ARRAY(SELECT l_id2 FROM "Nir_links" WHERE l_id1 = doc_id AND l_id_link_type=5));
	i := 1;
	while id_attr_mass[i] IS NOT NULL LOOP
		namess := (SELECT o_name FROM "Nir_object" WHERE o_id = id_attr_mass[i]);
		if (namess = name) then
			return -1;
		end if;
		i := i + 1;
	END LOOP;
	--добавление объекта
	INSERT INTO "Nir_object" (o_name, o_id_type) VALUES (name, 6);
	if exists(SELECT o_id FROM "Nir_object" WHERE o_name=name ORDER BY o_id DESC LIMIT 1) then
		--добавление связи
		id_attr := (SELECT o_id FROM "Nir_object" WHERE o_name=name ORDER BY o_id DESC LIMIT 1);
		INSERT INTO "Nir_links" (l_id1, l_id2, l_id_link_type, l_type_attr_id) VALUES (doc_id, id_attr, 5, 3);
		if exists(SELECT l_id FROM "Nir_links" WHERE l_id1=doc_id AND l_id2 = id_attr AND l_id_link_type=5 AND l_type_attr_id=3) then
			--добавление значения
			id_link = (SELECT l_id FROM "Nir_links" WHERE l_id1=doc_id AND l_id2 = id_attr AND l_id_link_type=5 AND l_type_attr_id=3);
			INSERT INTO "Nir_object_value_date" (ovd_value, ovd_link_id) VALUES (value, id_link);
			if exists(SELECT ovd_id FROM "Nir_object_value_date" WHERE ovd_link_id=id_link) then
				return 1;
			else
				return -1;
			end if;
		else
			return -1;
		end if;
	else
		return -1;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_doc_int (OID = 218742) :
--
CREATE FUNCTION public.add_attr_to_doc_int (
  name character varying,
  value integer,
  doc_id integer
)
RETURNS integer
AS
$body$
DECLARE
	id_attr integer;
	id_attr_mass integer[];
	id_link integer;
	i integer;
	namess character varying;
BEGIN
	--проверка, нет ли атрибута с таким же именем у документа
	id_attr_mass := (SELECT ARRAY(SELECT l_id2 FROM "Nir_links" WHERE l_id1 = doc_id AND l_id_link_type=5));
	i := 1;
	while id_attr_mass[i] IS NOT NULL LOOP
		namess := (SELECT o_name FROM "Nir_object" WHERE o_id = id_attr_mass[i]);
		if (namess = name) then
			return -1;
		end if;
		i := i + 1;
	END LOOP;
	--добавление объекта
	INSERT INTO "Nir_object" (o_name, o_id_type) VALUES (name, 6);
	if exists(SELECT o_id FROM "Nir_object" WHERE o_name=name ORDER BY o_id DESC LIMIT 1) then
		--добавление связи
		id_attr := (SELECT o_id FROM "Nir_object" WHERE o_name=name ORDER BY o_id DESC LIMIT 1);
		INSERT INTO "Nir_links" (l_id1, l_id2, l_id_link_type, l_type_attr_id) VALUES (doc_id, id_attr, 5, 1);
		if exists(SELECT l_id FROM "Nir_links" WHERE l_id1=doc_id AND l_id2 = id_attr AND l_id_link_type=5 AND l_type_attr_id=1) then
			--добавление значения
			id_link = (SELECT l_id FROM "Nir_links" WHERE l_id1=doc_id AND l_id2 = id_attr AND l_id_link_type=5 AND l_type_attr_id=1);
			INSERT INTO "Nir_object_value_int" (obi_value, obi_link_id) VALUES (value, id_link);
			if exists(SELECT obi_id FROM "Nir_object_value_int" WHERE obi_link_id=id_link) then
				return 1;
			else
				return -1;
			end if;
		else
			return -1;
		end if;
	else
		return -1;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_attr_to_doc_varchar (OID = 218743) :
--
CREATE FUNCTION public.add_attr_to_doc_varchar (
  name character varying,
  value character varying,
  doc_id integer
)
RETURNS integer
AS
$body$
DECLARE
	id_attr integer;
	id_attr_mass integer[];
	id_link integer;
	i integer;
	namess character varying;
BEGIN
	--проверка, нет ли атрибута с таким же именем у документа
	id_attr_mass := (SELECT ARRAY(SELECT l_id2 FROM "Nir_links" WHERE l_id1 = doc_id AND l_id_link_type=5));
	i := 1;
	while id_attr_mass[i] IS NOT NULL LOOP
		namess := (SELECT o_name FROM "Nir_object" WHERE o_id = id_attr_mass[i]);
		if (namess = name) then
			return -1;
		end if;
		i := i + 1;
	END LOOP;
	--добавление объекта
	INSERT INTO "Nir_object" (o_name, o_id_type) VALUES (name, 6);
	if exists(SELECT o_id FROM "Nir_object" WHERE o_name=name ORDER BY o_id DESC LIMIT 1) then
		--добавление связи
		id_attr := (SELECT o_id FROM "Nir_object" WHERE o_name=name ORDER BY o_id DESC LIMIT 1);
		INSERT INTO "Nir_links" (l_id1, l_id2, l_id_link_type, l_type_attr_id) VALUES (doc_id, id_attr, 5, 2);
		if exists(SELECT l_id FROM "Nir_links" WHERE l_id1=doc_id AND l_id2 = id_attr AND l_id_link_type=5 AND l_type_attr_id=2) then
			--добавление значения
			id_link = (SELECT l_id FROM "Nir_links" WHERE l_id1=doc_id AND l_id2 = id_attr AND l_id_link_type=5 AND l_type_attr_id=2);
			INSERT INTO "Nir_object_value_varchar" (ovv_value, ovv_link_id) VALUES (value, id_link);
			if exists(SELECT ovv_id FROM "Nir_object_value_varchar" WHERE ovv_link_id=id_link) then
				return 1;
			else
				return -1;
			end if;
		else
			return -1;
		end if;
	else
		return -1;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function add_tag_to_obj (OID = 218744) :
--
CREATE FUNCTION public.add_tag_to_obj (
  id_tag integer,
  id_object integer
)
RETURNS integer
AS
$body$

begin
	if not exists(SELECT l_id FROM "Nir_links" WHERE l_id1=id_object AND l_id2=id_tag AND l_id_link_type=4) then
		INSERT INTO "Nir_links" (l_id1, l_id2, l_id_link_type) VALUES (id_object, id_tag, 4);
		if exists(SELECT l_id FROM "Nir_links" WHERE l_id1=id_object AND l_id2=id_tag AND l_id_link_type=4) then
			return 1;
		else
			return 0;
		end if;
	end if;
	return -1;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addcatalog (OID = 218745) :
--
CREATE FUNCTION public.addcatalog (
  namess character varying,
  parent_id integer
)
RETURNS integer
AS
$body$
 DECLARE
	idCatalog integer;
BEGIN
	--проверяем, нет ли у родительского каталога дочернего с таким же именем, который хотим создать
	if not exists(SELECT o_id FROM "Nir_object" JOIN "Nir_links" ON l_id2=o_id WHERE l_id1=parent_id AND o_name=namess AND l_id_link_type=1) then
		INSERT INTO "Nir_object" (o_name,o_id_type) values (namess,'4');
		--получаем только что созданный каталог
		idCatalog := (SELECT o_id FROM "Nir_object" WHERE o_name = namess ORDER BY o_id DESC LIMIT 1);
		--добавляем связь с родительским
		INSERT INTO "Nir_links" (l_id1, l_id2, l_id_link_type) VALUES (parent_id, idCatalog, 1);
		if exists (SELECT l_id FROM "Nir_links" WHERE l_id1 = parent_id AND l_id2 = idCatalog AND l_id_link_type=1) then
			return idCatalog; -- после того как добавилась сязь возвращаем id каталога, который создали
		else
			return -0; --означает, что связь не добавилась
		end if;
	end if;
	return -1; --означает, что такой каталог уже существует
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function adddoc (OID = 218746) :
--
CREATE FUNCTION public.adddoc (
  namedoc character varying,
  tag text[] = NULL::text[]
)
RETURNS integer
AS
$body$
 --DECLARE objec varchar;
DECLARE idDoc int;
idTag int;
nameTag text;
begin
if not exists(select o_id, o_name  from "Nir_object" where o_id_type=5 and o_name = nameDoc) then
insert into "Nir_object" (o_name,o_id_type) values (nameDoc,'5');
end if;
idDoc := (select o_id from "Nir_object" where o_id_type=5 and o_name = nameDoc);
FOR nameTag IN SELECT unnest("tag")
LOOP
idTag:=( select * FROM addtag(nameTag));
 --idTag :=(select o_id from "Nir_object" where o_id_type=11 and o_name = nameTag )
 if not exists(select l_id from "Nir_links" where l_id1 = idDoc and l_id2 = idTag) then
 insert into "Nir_links" (l_id1,l_id2, l_id_link_type) values (idDoc, idTag,'4');
 end if;
END LOOP;
return idDoc;

end;

$body$
LANGUAGE plpgsql;
--
-- Definition for function addkz (OID = 218747) :
--
CREATE FUNCTION public.addkz (
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	idKZ integer;
begin
	if not exists(select o_id, o_name  from "Nir_object" where o_id_type=1 and o_name = namess) then
	insert into "Nir_object" (o_name,o_id_type) values (namess,'1');
	end if;
	idKZ := (select o_id from "Nir_object" where o_id_type=1 and o_name = namess);
	return idKZ;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function addtag (OID = 218748) :
--
CREATE FUNCTION public.addtag (
  namess character varying
)
RETURNS integer
AS
$body$
 --DECLARE objec varchar;
DECLARE idtag int;
begin
if not exists(select o_id, o_name  from "Nir_object" where o_id_type=11 and o_name = namess) then
insert into "Nir_object" (o_name,o_id_type) values (namess,'11');
end if;
idtag := (select o_id from "Nir_object" where o_id_type=11 and o_name = namess);
return idtag;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changenamedoc (OID = 218749) :
--
CREATE FUNCTION public.changenamedoc (
  id integer,
  parent_id integer,
  namess character varying
)
RETURNS integer
AS
$body$

BEGIN
	if not exists(SELECT o_id FROM "Nir_object" JOIN "Nir_links" ON l_id2=o_id WHERE l_id1=parent_id AND o_name=namess AND l_id_link_type=1) then
		UPDATE "Nir_object" SET o_name = namess WHERE o_id = id AND o_id_type=5;
		if exists(SELECT o_id FROM "Nir_object" JOIN "Nir_links" ON l_id2=o_id WHERE l_id1=parent_id AND o_name=namess AND l_id_link_type=1) then
			return 1;
		else
			return 0;
		end if;
	end if;
	return -1;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function changenamekz (OID = 218750) :
--
CREATE FUNCTION public.changenamekz (
  id integer,
  namess character varying
)
RETURNS integer
AS
$body$
 DECLARE
	--num_rows integer;
begin
	UPDATE "Nir_object" SET o_name = namess WHERE o_id = id AND o_id_type=1;
	if exists(SELECT o_id FROM "Nir_object" WHERE o_id = id AND o_name = namess) then
		return 1;
	else
		return 0;
	end if;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function dropatr (OID = 218751) :
--
CREATE FUNCTION public.dropatr (
  id integer,
  id_parent integer
)
RETURNS integer
AS
$body$
 --DECLARE objec varchar;
DECLARE
	link_id integer;
	type_attr integer;
BEGIN
	--удаление значения
	type_attr := (SELECT l_type_attr_id FROM "Nir_links" WHERE l_id1 = id_parent AND l_id2=id AND l_id_link_type=5);
	link_id := (SELECT l_id FROM "Nir_links" WHERE l_id1 = id_parent AND l_id2=id AND l_id_link_type=5);
	if (type_attr = 1)then
		DELETE FROM "Nir_object_value_int" WHERE obi_link_id=link_id;
	end if;
	if(type_attr = 2)then
		DELETE FROM "Nir_object_value_varchar" WHERE ovv_link_id=link_id;
	end if;
	if(type_attr = 3)then
		DELETE FROM "Nir_object_value_date" WHERE ovd_link_id=link_id;
	end if;


	--удаление связей с атрибутом
	DELETE FROM "Nir_links" WHERE l_id2 = id AND l_id1 = id_parent AND l_id_link_type = 5;
	if not exists(SELECT l_id FROM "Nir_links" WHERE l_id1=id_parent AND l_id2=id AND l_id_link_type=5) then
		DELETE FROM "Nir_object" WHERE o_id = id;
		--проверка удалился ли объект
		if not exists(SELECT o_name FROM "Nir_object" WHERE o_id=id) then
			return 1;
		else
			return 0;
		end if;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function dropdoc (OID = 218752) :
--
CREATE FUNCTION public.dropdoc (
  id integer
)
RETURNS integer
AS
$body$
DECLARE
	link_id_attr integer[];
	id_attr integer[];
	i integer;
	j integer;
BEGIN
	--Удаление связи с тегами
	DELETE FROM "Nir_links" WHERE l_id1 = id AND l_id_link_type = 4;
	--Удаление связи с родительским каталогом
	DELETE FROM "Nir_links" WHERE l_id2 = id AND l_id_link_type = 1;
	--Удаление значений атрибутов, связей с атрибутами и самих атрибутов
	link_id_attr := (SELECT ARRAY(SELECT l_id FROM "Nir_links" WHERE l_id1=id AND l_id_link_type = 5)); --получил все связи дока с атрибутами
	i := 1;
	while link_id_attr[i] IS NOT NULL LOOP
		if exists(SELECT ovv_id FROM "Nir_object_value_varchar" WHERE ovv_link_id=link_id_attr[i]) then
			DELETE FROM "Nir_object_value_varchar" WHERE ovv_link_id=link_id_attr[i];
			DELETE FROM "Nir_links" WHERE l_id=link_id_attr[i];
		end if;
		if exists(SELECT obi_id FROM "Nir_object_value_int" WHERE obi_link_id=link_id_attr[i]) then
			DELETE FROM "Nir_object_value_int" WHERE obi_link_id=link_id_attr[i];
			DELETE FROM "Nir_links" WHERE l_id=link_id_attr[i];
		end if;
		if exists(SELECT ovv_id FROM "Nir_object_value_date" WHERE ovd_link_id=link_id_attr[i]) then
			DELETE FROM "Nir_object_value_date" WHERE ovd_link_id=link_id_attr[i];
			DELETE FROM "Nir_links" WHERE l_id=link_id_attr[i];
		end if;
		i := i+1;
	END LOOP;

	id_attr := (SELECT ARRAY(SELECT l_id2 FROM "Nir_links" WHERE l_id1 = id AND l_id_link_type = 5));

	j := 1;
	while id_attr[j] IS NOT NULL LOOP
		DELETE FROM "Nir_object" WHERE o_id = id_attr[j];
	END LOOP;
	--Удаление самого документа из таблицы Nir_object
	DELETE FROM "Nir_object" WHERE o_id = id;
	return 1;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function droptag (OID = 218753) :
--
CREATE FUNCTION public.droptag (
  id integer,
  id_parent integer
)
RETURNS integer
AS
$body$
 --DECLARE objec varchar;
DECLARE
	--idtag int;
BEGIN
	--удаление связей с тегом
	DELETE FROM "Nir_links" WHERE l_id2 = id AND l_id1 = id_parent AND l_id_link_type = 4;
	--проверка удалился ли объект
	if not exists(SELECT l_id FROM "Nir_links" WHERE l_id2 = id AND l_id1 = id_parent AND l_id_link_type = 4) then
		return 1;
	else
		return 0;
	end if;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function get_teg_by_id (OID = 218754) :
--
CREATE FUNCTION public.get_teg_by_id (
  idd integer
)
RETURNS varchar
AS
$body$
DECLARE
	name character varying;
begin
	name := (SELECT o_name FROM "Nir_object" WHERE o_id = idd);
	return name;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for function getobjectbytag (OID = 218755) :
--
CREATE FUNCTION public.getobjectbytag (
  tag character varying,
  namess character varying
)
RETURNS TABLE (
  v character varying
)
AS
$body$
 --DECLARE objec varchar;
--begin
	select o_name from "Nir_object", "Nir_links" where o_id=l_id1 and
	l_id2 in (select o_id from "Nir_object", "Nir_object_type" where o_id_type=ot_id and ot_name=tag and o_name=namess);
--	RETURN objec;
--end
$body$
LANGUAGE sql;
--
-- Definition for function getroleactionsonobject (OID = 218756) :
--
CREATE FUNCTION public.getroleactionsonobject (
  iduser integer
)
RETURNS varchar
AS
$body$
DECLARE
	list character varying[];
BEGIN
	list := (SELECT ARRAY(SELECT ra_action_id FROM "Nir_object", "Nir_role_action", "Nir_Role", "Nir_user_role", "Nir_User"
WHERE ur_user_id = idUser AND ur_role_id = r_role_id AND r_role_id = ra_role_id AND ra_object_id = o_id));
	return list;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function getusersobject (OID = 218757) :
--
CREATE FUNCTION public.getusersobject (
  iduser integer
)
RETURNS varchar
AS
$body$
DECLARE
	list character varying[];
BEGIN
	list := (SELECT ARRAY(SELECT o_name FROM "Nir_object", "Nir_role_action", "Nir_Role", "Nir_user_role", "Nir_User"
WHERE ur_user_id = idUser AND ur_role_id = r_role_id AND r_role_id = ra_role_id AND ra_object_id = o_id));
	return list;
END;
$body$
LANGUAGE plpgsql;
--
-- Definition for function searchdocbyname (OID = 218758) :
--
CREATE FUNCTION public.searchdocbyname (
  namess character varying
)
RETURNS char
AS
$body$
 --DECLARE objec varchar;
DECLARE
	id_doc integer;
	tagMass character varying[];
	--atrMass character[];
	--atrValues character[];

begin
	id_doc :=(SELECT o_id FROM "Nir_object" WHERE o_name = namess);
	tagMass :=(SELECT ARRAY(SELECT o_name FROM "Nir_object" JOIN "Nir_links" ON o_id = l_id2 WHERE l_id1 = id_doc AND l_id_link_type = 4));
	return tagMass;
end;
$body$
LANGUAGE plpgsql;
--
-- Definition for sequence a_action_id_seq (OID = 218759) :
--
SET search_path = nir, pg_catalog;
CREATE SEQUENCE nir.a_action_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Definition for sequence o_id_seq (OID = 218761) :
--
CREATE SEQUENCE nir.o_id_seq
    START WITH 18
    INCREMENT BY 1
    MAXVALUE 2147483647
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_object (OID = 218763) :
--
CREATE TABLE nir.nir_object (
    o_id integer DEFAULT nextval('o_id_seq'::regclass) NOT NULL,
    o_name varchar NOT NULL,
    o_id_type smallint NOT NULL
)
WITH (oids = false);
--
-- Structure for table nir_user (OID = 218770) :
--
CREATE TABLE nir.nir_user (
    user_id integer NOT NULL,
    user_name varchar NOT NULL,
    user_id_system varchar,
    user_id_object integer
)
WITH (oids = false);
--
-- Structure for table nir_user_role (OID = 218776) :
--
CREATE TABLE nir.nir_user_role (
    user_id integer NOT NULL,
    role_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for view full_users_view (OID = 218779) :
--
CREATE VIEW nir.full_users_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    nir_object.o_id_type,
    nir_user.user_id,
    nir_user.user_name,
    nir_user.user_id_system,
    (EXISTS (
    SELECT nir_user_role.user_id,
            nir_user_role.role_id
    FROM nir_user_role
    WHERE ((nir_user_role.user_id = nir_user.user_id) AND
        (nir_user_role.role_id = 1))
    )) AS isadmin,
    (EXISTS (
    SELECT nir_user_role.user_id,
            nir_user_role.role_id
    FROM nir_user_role
    WHERE ((nir_user_role.user_id = nir_user.user_id) AND
        (nir_user_role.role_id <= 2))
    )) AS iseditor,
    (EXISTS (
    SELECT nir_user_role.user_id,
            nir_user_role.role_id
    FROM nir_user_role
    WHERE ((nir_user_role.user_id = nir_user.user_id) AND
        (nir_user_role.role_id <= 3))
    )) AS isworker,
    (EXISTS (
    SELECT nir_user_role.user_id,
            nir_user_role.role_id
    FROM nir_user_role
    WHERE ((nir_user_role.user_id = nir_user.user_id) AND
        (nir_user_role.role_id <= 4))
    )) AS isreader,
    (EXISTS (
    SELECT nir_user_role.user_id,
            nir_user_role.role_id
    FROM nir_user_role
    WHERE ((nir_user_role.user_id = nir_user.user_id) AND
        (nir_user_role.role_id <= 5))
    )) AS isdirector
FROM (nir_user
     JOIN nir_object ON ((nir_object.o_id = nir_user.user_id_object)));

--
-- Definition for sequence l_id_seq (OID = 218784) :
--
CREATE SEQUENCE nir.l_id_seq
    START WITH 18
    INCREMENT BY 1
    MAXVALUE 2147483647
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_links (OID = 218786) :
--
CREATE TABLE nir.nir_links (
    l_id integer DEFAULT nextval('l_id_seq'::regclass) NOT NULL,
    l_id1 integer NOT NULL,
    l_id2 integer NOT NULL,
    l_id_link_type smallint NOT NULL,
    l_type_attr_id smallint
)
WITH (oids = false);
--
-- Definition for sequence ovv_id_seq (OID = 218790) :
--
CREATE SEQUENCE nir.ovv_id_seq
    START WITH 18
    INCREMENT BY 1
    MAXVALUE 2147483647
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_object_value_varchar (OID = 218792) :
--
CREATE TABLE nir.nir_object_value_varchar (
    ovv_id integer DEFAULT nextval('ovv_id_seq'::regclass) NOT NULL,
    ovv_value varchar NOT NULL,
    ovv_link_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for view all_alerts_view (OID = 218799) :
--
CREATE VIEW nir.all_alerts_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    nir_object_value_varchar.ovv_value AS sql_txt,
    full_users_view.o_id AS user_id,
    full_users_view.user_id_system
FROM ((((nir_object
     JOIN nir_links v ON ((nir_object.o_id = v.l_id1)))
     JOIN nir_object_value_varchar ON ((v.l_id =
         nir_object_value_varchar.ovv_link_id)))
     LEFT JOIN nir_links u ON ((nir_object.o_id = u.l_id1)))
     LEFT JOIN full_users_view ON ((u.l_id2 = full_users_view.o_id)))
WHERE ((nir_object.o_id_type = 16) AND (v.l_id_link_type = 11) AND
    ((u.l_id_link_type = 9) OR (u.l_id_link_type IS NULL)));

--
-- Definition for view all_atrs_view (OID = 218804) :
--
CREATE VIEW nir.all_atrs_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    nir_links.l_type_attr_id
FROM nir_object,
    nir_links
WHERE ((nir_object.o_id_type = 6) AND (nir_object.o_id = nir_links.l_id1)
    AND (nir_object.o_id = nir_links.l_id2) AND (nir_links.l_id_link_type = 8));

--
-- Definition for view all_catalog_templates_view (OID = 218808) :
--
CREATE VIEW nir.all_catalog_templates_view
AS
SELECT nir_object.o_id,
    nir_object.o_name
FROM nir_object
WHERE (nir_object.o_id_type = 15);

--
-- Definition for view all_catalogs_view (OID = 218812) :
--
CREATE VIEW nir.all_catalogs_view
AS
SELECT nir_object.o_id,
    nir_object.o_name
FROM nir_object
WHERE (nir_object.o_id_type = 4);

--
-- Definition for view all_dbs_view (OID = 218816) :
--
CREATE VIEW nir.all_dbs_view
AS
SELECT nir_object.o_id,
    nir_object.o_name
FROM nir_object
WHERE (nir_object.o_id_type = 13);

--
-- Definition for view all_docs_view (OID = 218820) :
--
CREATE VIEW nir.all_docs_view
AS
SELECT nir_object.o_id,
    nir_object.o_name
FROM nir_object
WHERE (nir_object.o_id_type = 5);

--
-- Definition for sequence ovd_id_seq (OID = 218824) :
--
CREATE SEQUENCE nir.ovd_id_seq
    START WITH 18
    INCREMENT BY 1
    MAXVALUE 2147483647
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_object_value_datetime (OID = 218826) :
--
CREATE TABLE nir.nir_object_value_datetime (
    ovd_id integer DEFAULT nextval('ovd_id_seq'::regclass) NOT NULL,
    ovd_value timestamp without time zone NOT NULL,
    ovd_link_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for view all_kzcomments_view (OID = 218830) :
--
CREATE VIEW nir.all_kzcomments_view
AS
SELECT com.o_id,
    kz.o_id AS kz_id,
    com.o_name AS txt,
    u.o_id AS user_id,
    u.o_name AS user_name,
    val.ovd_value AS td
FROM (((((nir_object com
     LEFT JOIN nir_links l1 ON ((com.o_id = l1.l_id1)))
     LEFT JOIN nir_object kz ON ((kz.o_id = l1.l_id2)))
     LEFT JOIN nir_links l2 ON ((com.o_id = l2.l_id1)))
     LEFT JOIN nir_object u ON ((u.o_id = l2.l_id2)))
     LEFT JOIN nir_object_value_datetime val ON ((l2.l_id = val.ovd_link_id)))
WHERE ((com.o_id_type = 10) AND (l1.l_id_link_type = 7) AND (kz.o_id_type =
    1) AND (u.o_id_type = 2) AND (l2.l_id_link_type = 9));

--
-- Definition for view all_kzs_view (OID = 218835) :
--
CREATE VIEW nir.all_kzs_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    ((full_users_view.user_id_system)::name = "current_user"()) AS isowner,
    nir_links.l_id2 AS user_id,
    full_users_view.user_name
FROM ((nir_object
     JOIN nir_links ON ((nir_links.l_id1 = nir_object.o_id)))
     LEFT JOIN full_users_view ON ((full_users_view.o_id = nir_links.l_id2)))
WHERE ((nir_links.l_id_link_type = 9) AND (nir_object.o_id_type = 1));

--
-- Definition for view all_search_templates_view (OID = 218840) :
--
CREATE VIEW nir.all_search_templates_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    nir_object_value_varchar.ovv_value AS sql_txt,
    full_users_view.o_id AS user_id,
    full_users_view.user_id_system
FROM ((((nir_object
     JOIN nir_links v ON ((nir_object.o_id = v.l_id1)))
     JOIN nir_object_value_varchar ON ((v.l_id =
         nir_object_value_varchar.ovv_link_id)))
     LEFT JOIN nir_links u ON ((nir_object.o_id = u.l_id1)))
     LEFT JOIN full_users_view ON ((u.l_id2 = full_users_view.o_id)))
WHERE ((nir_object.o_id_type = 9) AND (v.l_id_link_type = 11) AND
    ((u.l_id_link_type = 9) OR (u.l_id_link_type IS NULL)));

--
-- Definition for view all_tags_view (OID = 218845) :
--
CREATE VIEW nir.all_tags_view
AS
SELECT nir_object.o_id,
    nir_object.o_name
FROM nir_object
WHERE (nir_object.o_id_type = 11);

--
-- Definition for view all_temas_view (OID = 218849) :
--
CREATE VIEW nir.all_temas_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    nir_object_value_varchar.ovv_value
FROM ((nir_object
     LEFT JOIN nir_links ON ((nir_links.l_id1 = nir_object.o_id)))
     LEFT JOIN nir_object_value_varchar ON ((nir_links.l_id =
         nir_object_value_varchar.ovv_link_id)))
WHERE ((nir_object.o_id_type = 17) AND (nir_links.l_id_link_type = 8));

--
-- Definition for view all_templates_view (OID = 218853) :
--
CREATE VIEW nir.all_templates_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    nir_object.o_id_type,
    (
    SELECT fu.o_id
    FROM full_users_view fu
    WHERE (EXISTS (
        SELECT u.l_id,
                    u.l_id1,
                    u.l_id2,
                    u.l_id_link_type,
                    u.l_type_attr_id
        FROM nir_links u
        WHERE ((fu.o_id = u.l_id2) AND (nir_object.o_id = u.l_id1) AND
            (u.l_id_link_type = 9))
        ))
    LIMIT 1
    ) AS user_id,
    (
    SELECT fu.user_id_system
    FROM full_users_view fu
    WHERE (EXISTS (
        SELECT u.l_id,
                    u.l_id1,
                    u.l_id2,
                    u.l_id_link_type,
                    u.l_type_attr_id
        FROM nir_links u
        WHERE ((fu.o_id = u.l_id2) AND (nir_object.o_id = u.l_id1) AND
            (u.l_id_link_type = 9))
        ))
    LIMIT 1
    ) AS user_id_system
FROM nir_object
WHERE (nir_object.o_id_type = ANY (ARRAY[7, 8, 9, 15, 16]));

--
-- Definition for sequence obi_id_seq (OID = 218858) :
--
CREATE SEQUENCE nir.obi_id_seq
    START WITH 18
    INCREMENT BY 1
    MAXVALUE 2147483647
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_object_value_int (OID = 218860) :
--
CREATE TABLE nir.nir_object_value_int (
    obi_id integer DEFAULT nextval('obi_id_seq'::regclass) NOT NULL,
    obi_value integer NOT NULL,
    obi_link_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for view atrs_view (OID = 218864) :
--
CREATE VIEW nir.atrs_view
AS
SELECT t.o_id AS atr_id,
    t.o_name AS atr_name,
    t.o_id_type AS atr_type,
    nir_links.l_type_attr_id AS atr_typr,
    nir_object_value_int.obi_value AS intval,
    nir_object_value_varchar.ovv_value AS charval,
    nir_object_value_datetime.ovd_value AS dtval,
    o.o_id AS obj_id,
    o.o_name AS obj_name,
    o.o_id_type AS obj_type
FROM nir_object o,
    nir_object t,
    (((nir_links
     LEFT JOIN nir_object_value_int ON ((nir_links.l_id =
         nir_object_value_int.obi_link_id)))
     LEFT JOIN nir_object_value_varchar ON ((nir_links.l_id =
         nir_object_value_varchar.ovv_link_id)))
     LEFT JOIN nir_object_value_datetime ON ((nir_links.l_id =
         nir_object_value_datetime.ovd_link_id)))
WHERE ((nir_links.l_id1 = o.o_id) AND (nir_links.l_id2 = t.o_id) AND
    (nir_links.l_id_link_type = 5));

--
-- Definition for view links_view (OID = 218869) :
--
CREATE VIEW nir.links_view
AS
SELECT o.o_id AS o_id_1,
    o.o_name AS o_name_1,
    o.o_id_type AS o_type_1,
    t.o_id AS o_id_2,
    t.o_name AS o_name_2,
    t.o_id_type AS o_type_2,
    nir_links.l_id,
    nir_links.l_id_link_type,
    nir_links.l_type_attr_id
FROM nir_object o,
    nir_object t,
    nir_links
WHERE ((nir_links.l_id1 = o.o_id) AND (nir_links.l_id2 = t.o_id));

--
-- Definition for view atrs_view_2 (OID = 218873) :
--
CREATE VIEW nir.atrs_view_2
AS
SELECT links_view.o_id_1 AS obj_id,
    links_view.o_name_1 AS obj_name,
    links_view.o_type_1 AS obj_type,
    links_view.o_id_2 AS atr_id,
    links_view.o_name_2 AS atr_name,
    links_view.l_type_attr_id AS atr_type,
    (nir_object_value_int.obi_value)::text AS atr_value
FROM (links_view
     LEFT JOIN nir_object_value_int ON ((links_view.l_id =
         nir_object_value_int.obi_link_id)))
WHERE ((links_view.l_type_attr_id = 1) AND (links_view.l_id_link_type = 5))
UNION
SELECT links_view.o_id_1 AS obj_id,
    links_view.o_name_1 AS obj_name,
    links_view.o_type_1 AS obj_type,
    links_view.o_id_2 AS atr_id,
    links_view.o_name_2 AS atr_name,
    links_view.l_type_attr_id AS atr_type,
    nir_object_value_varchar.ovv_value AS atr_value
FROM (links_view
     LEFT JOIN nir_object_value_varchar ON ((links_view.l_id =
         nir_object_value_varchar.ovv_link_id)))
WHERE ((links_view.l_type_attr_id = 2) AND (links_view.l_id_link_type = 5))
UNION
SELECT links_view.o_id_1 AS obj_id,
    links_view.o_name_1 AS obj_name,
    links_view.o_type_1 AS obj_type,
    links_view.o_id_2 AS atr_id,
    links_view.o_name_2 AS atr_name,
    links_view.l_type_attr_id AS atr_type,
    (nir_object_value_datetime.ovd_value)::text AS atr_value
FROM (links_view
     LEFT JOIN nir_object_value_datetime ON ((links_view.l_id =
         nir_object_value_datetime.ovd_link_id)))
WHERE ((links_view.l_type_attr_id = 3) AND (links_view.l_id_link_type = 5));

--
-- Definition for view nir_parent_view (OID = 218878) :
--
CREATE VIEW nir.nir_parent_view
AS
SELECT obj.o_id AS obj_id,
    obj.o_name AS obj_name,
    obj.o_id_type AS obj_type,
    par.o_id AS parent_id,
    par.o_name AS parent_name,
    par.o_id_type AS parent_id_type
FROM ((
    SELECT a.o_id,
            a.o_name,
            a.o_id_type,
            b.l_id2
    FROM (nir_object a
             JOIN nir_links b ON ((a.o_id = b.l_id1)))
    WHERE ((a.o_id_type = ANY (ARRAY[4, 5])) AND (b.l_id_link_type =
        (1)::smallint))
    ) obj
     JOIN nir_object par ON ((obj.l_id2 = par.o_id)));

--
-- Definition for view cats_of_cat_view (OID = 218883) :
--
CREATE VIEW nir.cats_of_cat_view
AS
SELECT nir_parent_view.parent_id,
    nir_parent_view.parent_name,
    nir_parent_view.parent_id_type,
    nir_parent_view.obj_id,
    nir_parent_view.obj_name
FROM nir_parent_view
WHERE (nir_parent_view.obj_type = 4);

--
-- Definition for view docs_of_cat_view (OID = 218887) :
--
CREATE VIEW nir.docs_of_cat_view
AS
SELECT nir_parent_view.parent_id,
    nir_parent_view.parent_name,
    nir_parent_view.parent_id_type,
    nir_parent_view.obj_id,
    nir_parent_view.obj_name
FROM nir_parent_view
WHERE (nir_parent_view.obj_type = 5);

--
-- Structure for table nir_group (OID = 218891) :
--
CREATE TABLE nir.nir_group (
    group_id integer NOT NULL,
    group_name varchar NOT NULL,
    id_object integer,
    gr_sys_name text
)
WITH (oids = false);
--
-- Structure for table nir_group_role (OID = 218897) :
--
CREATE TABLE nir.nir_group_role (
    group_id integer NOT NULL,
    role_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for view full_groups_view (OID = 218900) :
--
CREATE VIEW nir.full_groups_view
AS
SELECT nir_object.o_id,
    nir_object.o_name,
    nir_object.o_id_type,
    nir_group.group_id,
    nir_group.group_name,
    nir_group.gr_sys_name,
    (EXISTS (
    SELECT nir_group_role.group_id,
            nir_group_role.role_id
    FROM nir_group_role
    WHERE ((nir_group_role.group_id = nir_group.group_id) AND
        (nir_group_role.role_id = 1))
    )) AS isadmin,
    (EXISTS (
    SELECT nir_group_role.group_id,
            nir_group_role.role_id
    FROM nir_group_role
    WHERE ((nir_group_role.group_id = nir_group.group_id) AND
        (nir_group_role.role_id <= 2))
    )) AS iseditor,
    (EXISTS (
    SELECT nir_group_role.group_id,
            nir_group_role.role_id
    FROM nir_group_role
    WHERE ((nir_group_role.group_id = nir_group.group_id) AND
        (nir_group_role.role_id <= 3))
    )) AS isworker,
    (EXISTS (
    SELECT nir_group_role.group_id,
            nir_group_role.role_id
    FROM nir_group_role
    WHERE ((nir_group_role.group_id = nir_group.group_id) AND
        (nir_group_role.role_id <= 4))
    )) AS isreader,
    (EXISTS (
    SELECT nir_group_role.group_id,
            nir_group_role.role_id
    FROM nir_group_role
    WHERE ((nir_group_role.group_id = nir_group.group_id) AND
        (nir_group_role.role_id <= 5))
    )) AS isdirector
FROM (nir_group
     JOIN nir_object ON ((nir_object.o_id = nir_group.id_object)));

--
-- Definition for sequence role_id_seq (OID = 218905) :
--
CREATE SEQUENCE nir.role_id_seq
    START WITH 23
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_role (OID = 218907) :
--
CREATE TABLE nir.nir_role (
    r_id integer DEFAULT nextval('role_id_seq'::regclass) NOT NULL,
    r_name varchar NOT NULL,
    r_info varchar NOT NULL,
    r_desc varchar,
    r_parent integer,
    r_code bit varying DEFAULT B'0'::"bit"
)
WITH (oids = false);
--
-- Definition for view group_role_view (OID = 218915) :
--
CREATE VIEW nir.group_role_view
AS
SELECT u.group_name,
    u.gr_sys_name,
    r.r_name,
    r.r_info,
    r.r_desc
FROM ((nir_group_role ur
     JOIN nir_group u ON ((ur.group_id = u.group_id)))
     JOIN nir_role r ON ((r.r_id = ur.role_id)));

--
-- Structure for table nir_group_user (OID = 218919) :
--
CREATE TABLE nir.nir_group_user (
    user_id integer NOT NULL,
    group_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for view group_user_view (OID = 218922) :
--
CREATE VIEW nir.group_user_view
AS
SELECT u.user_id,
    u.user_id_object AS obj_user_id,
    u.user_name,
    u.user_id_system,
    g.group_id,
    g.id_object AS obj_group_id,
    g.group_name,
    g.gr_sys_name
FROM ((nir_group_user gu
     JOIN nir_user u ON ((u.user_id = gu.user_id)))
     JOIN nir_group g ON ((g.group_id = gu.group_id)));

--
-- Definition for sequence kzcomment_id_seq (OID = 218926) :
--
CREATE SEQUENCE nir.kzcomment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Definition for sequence lt_id_seq (OID = 218928) :
--
CREATE SEQUENCE nir.lt_id_seq
    START WITH 1
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Definition for sequence module_id_seq (OID = 218930) :
--
CREATE SEQUENCE nir.module_id_seq
    START WITH 23
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Definition for sequence module_role_id_seq (OID = 218932) :
--
CREATE SEQUENCE nir.module_role_id_seq
    START WITH 23
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Definition for view nir_kz_parent_view (OID = 218934) :
--
CREATE VIEW nir.nir_kz_parent_view
AS
SELECT obj.o_id AS doc_id,
    obj.o_name AS doc_name,
    obj.o_id_type AS doc_id_type,
    par.o_id AS parent_id
FROM ((
    SELECT a.o_id,
            a.o_name,
            a.o_id_type,
            b.l_id2
    FROM (nir_object a
             JOIN nir_links b ON ((a.o_id = b.l_id1)))
    WHERE ((a.o_id_type = ANY (ARRAY[1, 5])) AND (b.l_id_link_type =
        (1)::smallint))
    ) obj
     JOIN nir_object par ON ((obj.l_id2 = par.o_id)))
WHERE (par.o_id_type = (1)::smallint);

--
-- Structure for table nir_link_type (OID = 218939) :
--
CREATE TABLE nir.nir_link_type (
    lt_id integer DEFAULT nextval('lt_id_seq'::regclass) NOT NULL,
    lt_name varchar NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence object_role_id_seq (OID = 218946) :
--
CREATE SEQUENCE nir.object_role_id_seq
    START WITH 25
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_object_role (OID = 218948) :
--
CREATE TABLE nir.nir_object_role (
    object_role_id integer DEFAULT nextval('object_role_id_seq'::regclass) NOT NULL,
    object_id integer NOT NULL,
    role_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence ot_id_seq (OID = 218952) :
--
CREATE SEQUENCE nir.ot_id_seq
    START WITH 1
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_object_type (OID = 218954) :
--
CREATE TABLE nir.nir_object_type (
    ot_id smallint DEFAULT nextval('ot_id_seq'::regclass) NOT NULL,
    ot_name varchar NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence vam_id_seq (OID = 218961) :
--
CREATE SEQUENCE nir.vam_id_seq
    START WITH 155
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_object_value_act_mask (OID = 218963) :
--
CREATE TABLE nir.nir_object_value_act_mask (
    vam_id integer DEFAULT nextval('vam_id_seq'::regclass) NOT NULL,
    vam_value integer NOT NULL,
    vam_link_id integer NOT NULL,
    vam_value2 integer,
    vam_value3 integer,
    vam_value4 integer DEFAULT 0
)
WITH (oids = false);
--
-- Definition for sequence ta_id_seq (OID = 218968) :
--
CREATE SEQUENCE nir.ta_id_seq
    START WITH 1
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Structure for table nir_type_attr (OID = 218970) :
--
CREATE TABLE nir.nir_type_attr (
    ta_id smallint DEFAULT nextval('ta_id_seq'::regclass) NOT NULL,
    ta_name text NOT NULL
)
WITH (oids = false);
--
-- Structure for table nir_user_ald (OID = 218977) :
--
CREATE TABLE nir.nir_user_ald (
    id integer NOT NULL,
    full_name varchar,
    number varchar,
    birthday date,
    username text
)
WITH (oids = false);
--
-- Definition for sequence ra_id_seq (OID = 218983) :
--
CREATE SEQUENCE nir.ra_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table rights_access (OID = 218985) :
--
CREATE TABLE nir.rights_access (
    roa_id serial NOT NULL,
    roa_id_object integer,
    roa_id_subject integer,
    roa_bit_map bit varying DEFAULT B'0'::"bit" NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence rights_of_access_id_seq (OID = 218994) :
--
CREATE SEQUENCE nir.rights_of_access_id_seq
    START WITH 26
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Structure for table rights_of_groups (OID = 218996) :
--
CREATE TABLE nir.rights_of_groups (
    rog_id serial NOT NULL,
    rog_id_object integer,
    rog_id_subject integer,
    rog_bit_map bit varying DEFAULT B'0'::"bit" NOT NULL
)
WITH (oids = false);
--
-- Structure for table role_obj_type (OID = 219005) :
--
CREATE TABLE nir.role_obj_type (
    role_access_id serial NOT NULL,
    role_id integer,
    role_access_id_object_type integer
)
WITH (oids = false);
--
-- Definition for view role_access_real (OID = 219008) :
--
CREATE VIEW nir.role_access_real
AS
SELECT role_obj_type.role_access_id,
    nir_role.r_info AS role_access_name,
    nir_role.r_desc AS role_access_desc,
    role_obj_type.role_access_id_object_type,
    nir_role.r_code AS role_access_mask
FROM (role_obj_type
     LEFT JOIN nir_role ON ((nir_role.r_id = role_obj_type.role_id)));

--
-- Definition for sequence role_access_seq (OID = 219012) :
--
CREATE SEQUENCE nir.role_access_seq
    START WITH 26
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Definition for view tags_view (OID = 219016) :
--
CREATE VIEW nir.tags_view
AS
SELECT t.o_id AS tag_id,
    t.o_name AS tag_name,
    t.o_id_type AS tag_type,
    o.o_id AS obj_id,
    o.o_name AS obj_name,
    o.o_id_type AS obj_type
FROM nir_object o,
    nir_links,
    nir_object t
WHERE ((nir_links.l_id1 = o.o_id) AND (nir_links.l_id2 = t.o_id) AND
    (nir_links.l_id_link_type = 4));

--
-- Definition for sequence user_groiup_id_seq (OID = 219020) :
--
CREATE SEQUENCE nir.user_groiup_id_seq
    START WITH 26
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Definition for sequence user_id_seq (OID = 219022) :
--
CREATE SEQUENCE nir.user_id_seq
    START WITH 23
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Definition for view user_profile_view (OID = 219024) :
--
CREATE VIEW nir.user_profile_view
AS
SELECT ttt.o_id_1 AS profile_id,
    ttt.o_name_1 AS profile_name,
    uuu.o_id AS user_id
FROM (nir_object uuu
     LEFT JOIN (
    SELECT t.o_id_2 AS uid,
            t.o_id_1,
            t.o_name_1
    FROM links_view t
    WHERE ((t.o_type_1 = 18) AND (t.o_type_2 = 2))
    ) ttt ON ((ttt.uid = uuu.o_id)))
WHERE (uuu.o_id_type = 2);

--
-- Definition for sequence user_role_id_seq (OID = 219028) :
--
CREATE SEQUENCE nir.user_role_id_seq
    START WITH 23
    INCREMENT BY 1
    MAXVALUE 32767
    NO MINVALUE
    CACHE 1;
--
-- Definition for view user_role_view (OID = 219030) :
--
CREATE VIEW nir.user_role_view
AS
SELECT u.user_id_system,
    u.user_name,
    r.r_name,
    r.r_info,
    r.r_desc
FROM ((nir_user_role ur
     JOIN nir_user u ON ((ur.user_id = u.user_id)))
     JOIN nir_role r ON ((r.r_id = ur.role_id)));

--
-- Definition for view user_tema_view (OID = 219034) :
--
CREATE VIEW nir.user_tema_view
AS
SELECT ttt.o_id,
    ttt.o_name,
    ttt.ovv_value,
    uuu.o_id AS user_id
FROM (nir_object uuu
     LEFT JOIN (
    SELECT all_temas_view.o_id,
            all_temas_view.o_name,
            all_temas_view.ovv_value,
            u.o_id_2 AS uid
    FROM ((links_view t
             LEFT JOIN links_view u ON ((t.o_id_2 = u.o_id_1)))
             LEFT JOIN all_temas_view ON ((t.o_id_1 = all_temas_view.o_id)))
    WHERE ((t.o_type_1 = 17) AND (t.o_type_2 = 18) AND (u.o_type_2 = 2))
    ) ttt ON ((ttt.uid = uuu.o_id)))
WHERE (uuu.o_id_type = 2);

--
-- Definition for sequence a_action_id_seq (OID = 219039) :
--
SET search_path = public, pg_catalog;
CREATE SEQUENCE public.a_action_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_Action (OID = 219041) :
--
CREATE TABLE public."Nir_Action" (
    a_action_id integer DEFAULT nextval('a_action_id_seq'::regclass) NOT NULL,
    a_add_object boolean NOT NULL,
    a_browse_object boolean NOT NULL,
    a_edit_object boolean NOT NULL,
    a_delete_object boolean NOT NULL,
    "a_addComment_object" boolean NOT NULL,
    "a_deleteComment_object" boolean NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence r_role_id_seq (OID = 219045) :
--
CREATE SEQUENCE public.r_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_Role (OID = 219047) :
--
CREATE TABLE public."Nir_Role" (
    r_role_id integer DEFAULT nextval('r_role_id_seq'::regclass) NOT NULL,
    "r_roleName" varchar NOT NULL,
    r_information varchar NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence u_userid_seq (OID = 219054) :
--
CREATE SEQUENCE public.u_userid_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_User (OID = 219056) :
--
CREATE TABLE public."Nir_User" (
    "u_userId" integer DEFAULT nextval('u_userid_seq'::regclass) NOT NULL,
    u_username varchar NOT NULL,
    u_password varchar NOT NULL,
    u_info varchar NOT NULL,
    u_id_object integer
)
WITH (oids = false);
--
-- Definition for sequence lt_id_seq (OID = 219063) :
--
CREATE SEQUENCE public.lt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_link_type (OID = 219065) :
--
CREATE TABLE public."Nir_link_type" (
    lt_id integer DEFAULT nextval('lt_id_seq'::regclass) NOT NULL,
    lt_name varchar NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence l_id_seq (OID = 219072) :
--
CREATE SEQUENCE public.l_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_links (OID = 219074) :
--
CREATE TABLE public."Nir_links" (
    l_id integer DEFAULT nextval('l_id_seq'::regclass) NOT NULL,
    l_id1 integer NOT NULL,
    l_id2 integer NOT NULL,
    l_id_link_type integer NOT NULL,
    l_type_attr_id integer
)
WITH (oids = false);
--
-- Definition for sequence o_id_seq (OID = 219078) :
--
CREATE SEQUENCE public.o_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_object (OID = 219080) :
--
CREATE TABLE public."Nir_object" (
    o_id integer DEFAULT nextval('o_id_seq'::regclass) NOT NULL,
    o_name varchar(255) NOT NULL,
    o_id_type integer NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence ot_id_seq (OID = 219084) :
--
CREATE SEQUENCE public.ot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_object_type (OID = 219086) :
--
CREATE TABLE public."Nir_object_type" (
    ot_id integer DEFAULT nextval('ot_id_seq'::regclass) NOT NULL,
    ot_name varchar NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence ovd_id_seq (OID = 219093) :
--
CREATE SEQUENCE public.ovd_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_object_value_date (OID = 219095) :
--
CREATE TABLE public."Nir_object_value_date" (
    ovd_id integer DEFAULT nextval('ovd_id_seq'::regclass) NOT NULL,
    ovd_value date NOT NULL,
    ovd_link_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence obi_id_seq (OID = 219099) :
--
CREATE SEQUENCE public.obi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_object_value_int (OID = 219101) :
--
CREATE TABLE public."Nir_object_value_int" (
    obi_id integer DEFAULT nextval('obi_id_seq'::regclass) NOT NULL,
    obi_value integer NOT NULL,
    obi_link_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence ovv_id_seq (OID = 219105) :
--
CREATE SEQUENCE public.ovv_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_object_value_varchar (OID = 219107) :
--
CREATE TABLE public."Nir_object_value_varchar" (
    ovv_id integer DEFAULT nextval('ovv_id_seq'::regclass) NOT NULL,
    ovv_value varchar NOT NULL,
    ovv_link_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence ra_id_seq (OID = 219114) :
--
CREATE SEQUENCE public.ra_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_role_action (OID = 219116) :
--
CREATE TABLE public."Nir_role_action" (
    ra_id integer DEFAULT nextval('ra_id_seq'::regclass) NOT NULL,
    ra_role_id integer NOT NULL,
    ra_action_id integer NOT NULL,
    ra_object_id integer NOT NULL
)
WITH (oids = false);
--
-- Definition for sequence ta_id_seq (OID = 219120) :
--
CREATE SEQUENCE public.ta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_type_attr (OID = 219122) :
--
CREATE TABLE public."Nir_type_attr" (
    ta_id integer DEFAULT nextval('ta_id_seq'::regclass) NOT NULL,
    ta_name text
)
WITH (oids = false);
--
-- Definition for sequence ur_usertorole_seq (OID = 219129) :
--
CREATE SEQUENCE public.ur_usertorole_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
--
-- Structure for table Nir_user_role (OID = 219131) :
--
CREATE TABLE public."Nir_user_role" (
    "ur_userToRole" integer DEFAULT nextval('ur_usertorole_seq'::regclass) NOT NULL,
    ur_role_id integer NOT NULL,
    ur_user_id integer NOT NULL
)
WITH (oids = false);
--
-- Structure for table objec (OID = 219135) :
--
CREATE TABLE public.objec (
    o_name varchar(255)
)
WITH (oids = false);
--
-- Definition for index fki_user_id_object (OID = 219211) :
--
SET search_path = nir, pg_catalog;
CREATE INDEX fki_user_id_object ON nir_user USING btree (user_id_object);
--
-- Definition for index fki_user_id_object (OID = 219212) :
--
SET search_path = public, pg_catalog;
CREATE INDEX fki_user_id_object ON "Nir_User" USING btree (u_id_object);
--
-- Definition for index Nir_Role_id (OID = 219141) :
--
SET search_path = nir, pg_catalog;
ALTER TABLE ONLY nir_role
    ADD CONSTRAINT "Nir_Role_id"
    PRIMARY KEY (r_id);
--
-- Definition for index Nir_User_Role_id (OID = 219143) :
--
ALTER TABLE ONLY nir_user_role
    ADD CONSTRAINT "Nir_User_Role_id"
    PRIMARY KEY (user_id, role_id);
--
-- Definition for index Nir_User_group_id (OID = 219145) :
--
ALTER TABLE ONLY nir_group_role
    ADD CONSTRAINT "Nir_User_group_id"
    PRIMARY KEY (group_id, role_id);
--
-- Definition for index Nir_User_pk (OID = 219147) :
--
ALTER TABLE ONLY nir_user
    ADD CONSTRAINT "Nir_User_pk"
    PRIMARY KEY (user_id);
--
-- Definition for index Nir_User_pk2 (OID = 219149) :
--
ALTER TABLE ONLY nir_user_ald
    ADD CONSTRAINT "Nir_User_pk2"
    PRIMARY KEY (id);
--
-- Definition for index Nir_group_pk (OID = 219151) :
--
ALTER TABLE ONLY nir_group
    ADD CONSTRAINT "Nir_group_pk"
    PRIMARY KEY (group_id);
--
-- Definition for index Nir_rights_access (OID = 219153) :
--
ALTER TABLE ONLY rights_access
    ADD CONSTRAINT "Nir_rights_access"
    PRIMARY KEY (roa_id);
--
-- Definition for index Nir_rights_of_groups (OID = 219155) :
--
ALTER TABLE ONLY rights_of_groups
    ADD CONSTRAINT "Nir_rights_of_groups"
    PRIMARY KEY (rog_id);
--
-- Definition for index Nir_user_group_pk (OID = 219157) :
--
ALTER TABLE ONLY nir_group_user
    ADD CONSTRAINT "Nir_user_group_pk"
    PRIMARY KEY (user_id, group_id);
--
-- Definition for index nir_link_type_lt_name_key (OID = 219159) :
--
ALTER TABLE ONLY nir_link_type
    ADD CONSTRAINT nir_link_type_lt_name_key
    UNIQUE (lt_name);
--
-- Definition for index nir_link_type_pk (OID = 219161) :
--
ALTER TABLE ONLY nir_link_type
    ADD CONSTRAINT nir_link_type_pk
    PRIMARY KEY (lt_id);
--
-- Definition for index nir_links_pk (OID = 219163) :
--
ALTER TABLE ONLY nir_links
    ADD CONSTRAINT nir_links_pk
    PRIMARY KEY (l_id);
--
-- Definition for index nir_object_pk (OID = 219165) :
--
ALTER TABLE ONLY nir_object
    ADD CONSTRAINT nir_object_pk
    PRIMARY KEY (o_id);
--
-- Definition for index nir_object_role_id (OID = 219167) :
--
ALTER TABLE ONLY nir_object_role
    ADD CONSTRAINT nir_object_role_id
    PRIMARY KEY (object_role_id);
--
-- Definition for index nir_object_type_ot_name_key (OID = 219169) :
--
ALTER TABLE ONLY nir_object_type
    ADD CONSTRAINT nir_object_type_ot_name_key
    UNIQUE (ot_name);
--
-- Definition for index nir_object_type_pk (OID = 219171) :
--
ALTER TABLE ONLY nir_object_type
    ADD CONSTRAINT nir_object_type_pk
    PRIMARY KEY (ot_id);
--
-- Definition for index nir_object_value_datetime_pk (OID = 219173) :
--
ALTER TABLE ONLY nir_object_value_datetime
    ADD CONSTRAINT nir_object_value_datetime_pk
    PRIMARY KEY (ovd_id);
--
-- Definition for index nir_object_value_int_pk (OID = 219175) :
--
ALTER TABLE ONLY nir_object_value_int
    ADD CONSTRAINT nir_object_value_int_pk
    PRIMARY KEY (obi_id);
--
-- Definition for index nir_object_value_varchar_pk (OID = 219177) :
--
ALTER TABLE ONLY nir_object_value_varchar
    ADD CONSTRAINT nir_object_value_varchar_pk
    PRIMARY KEY (ovv_id);
--
-- Definition for index nir_role_obj_type_pk (OID = 219179) :
--
ALTER TABLE ONLY role_obj_type
    ADD CONSTRAINT nir_role_obj_type_pk
    PRIMARY KEY (role_access_id);
--
-- Definition for index nir_type_attr_ta_name_key (OID = 219181) :
--
ALTER TABLE ONLY nir_type_attr
    ADD CONSTRAINT nir_type_attr_ta_name_key
    UNIQUE (ta_name);
--
-- Definition for index pk_type_attr (OID = 219183) :
--
ALTER TABLE ONLY nir_type_attr
    ADD CONSTRAINT pk_type_attr
    PRIMARY KEY (ta_id);
--
-- Definition for index nir_action_pk (OID = 219185) :
--
SET search_path = public, pg_catalog;
ALTER TABLE ONLY "Nir_Action"
    ADD CONSTRAINT nir_action_pk
    PRIMARY KEY (a_action_id);
--
-- Definition for index nir_link_type_pk (OID = 219187) :
--
ALTER TABLE ONLY "Nir_link_type"
    ADD CONSTRAINT nir_link_type_pk
    PRIMARY KEY (lt_id);
--
-- Definition for index nir_links_pk (OID = 219189) :
--
ALTER TABLE ONLY "Nir_links"
    ADD CONSTRAINT nir_links_pk
    PRIMARY KEY (l_id);
--
-- Definition for index nir_object_pk (OID = 219191) :
--
ALTER TABLE ONLY "Nir_object"
    ADD CONSTRAINT nir_object_pk
    PRIMARY KEY (o_id);
--
-- Definition for index nir_object_type_pk (OID = 219193) :
--
ALTER TABLE ONLY "Nir_object_type"
    ADD CONSTRAINT nir_object_type_pk
    PRIMARY KEY (ot_id);
--
-- Definition for index nir_object_value_date_pk (OID = 219195) :
--
ALTER TABLE ONLY "Nir_object_value_date"
    ADD CONSTRAINT nir_object_value_date_pk
    PRIMARY KEY (ovd_id);
--
-- Definition for index nir_object_value_int_pk (OID = 219197) :
--
ALTER TABLE ONLY "Nir_object_value_int"
    ADD CONSTRAINT nir_object_value_int_pk
    PRIMARY KEY (obi_id);
--
-- Definition for index nir_object_value_varchar_pk (OID = 219199) :
--
ALTER TABLE ONLY "Nir_object_value_varchar"
    ADD CONSTRAINT nir_object_value_varchar_pk
    PRIMARY KEY (ovv_id);
--
-- Definition for index nir_role_action_pk (OID = 219201) :
--
ALTER TABLE ONLY "Nir_role_action"
    ADD CONSTRAINT nir_role_action_pk
    PRIMARY KEY (ra_id);
--
-- Definition for index nir_role_pk (OID = 219203) :
--
ALTER TABLE ONLY "Nir_Role"
    ADD CONSTRAINT nir_role_pk
    PRIMARY KEY (r_role_id);
--
-- Definition for index nir_user_pk (OID = 219205) :
--
ALTER TABLE ONLY "Nir_User"
    ADD CONSTRAINT nir_user_pk
    PRIMARY KEY ("u_userId");
--
-- Definition for index nir_user_role_pk (OID = 219207) :
--
ALTER TABLE ONLY "Nir_user_role"
    ADD CONSTRAINT nir_user_role_pk
    PRIMARY KEY ("ur_userToRole");
--
-- Definition for index pk_type_attr (OID = 219209) :
--
ALTER TABLE ONLY "Nir_type_attr"
    ADD CONSTRAINT pk_type_attr
    PRIMARY KEY (ta_id);
--
-- Definition for index CASCADE_DELETE_UPADTE__act_mask (OID = 219213) :
--
SET search_path = nir, pg_catalog;
ALTER TABLE ONLY nir_object_value_act_mask
    ADD CONSTRAINT "CASCADE_DELETE_UPADTE__act_mask"
    FOREIGN KEY (vam_link_id) REFERENCES nir_links(l_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPDATE_group_role1 (OID = 219218) :
--
ALTER TABLE ONLY nir_group_role
    ADD CONSTRAINT "CASCADE_DELETE_UPDATE_group_role1"
    FOREIGN KEY (group_id) REFERENCES nir_group(group_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPDATE_group_role2 (OID = 219223) :
--
ALTER TABLE ONLY nir_group_role
    ADD CONSTRAINT "CASCADE_DELETE_UPDATE_group_role2"
    FOREIGN KEY (role_id) REFERENCES nir_role(r_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPDATE_object_role1 (OID = 219228) :
--
ALTER TABLE ONLY nir_object_role
    ADD CONSTRAINT "CASCADE_DELETE_UPDATE_object_role1"
    FOREIGN KEY (object_id) REFERENCES nir_object(o_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPDATE_object_role2 (OID = 219233) :
--
ALTER TABLE ONLY nir_object_role
    ADD CONSTRAINT "CASCADE_DELETE_UPDATE_object_role2"
    FOREIGN KEY (role_id) REFERENCES nir_role(r_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPDATE_user_role1 (OID = 219238) :
--
ALTER TABLE ONLY nir_user_role
    ADD CONSTRAINT "CASCADE_DELETE_UPDATE_user_role1"
    FOREIGN KEY (user_id) REFERENCES nir_user(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPDATE_user_role2 (OID = 219243) :
--
ALTER TABLE ONLY nir_user_role
    ADD CONSTRAINT "CASCADE_DELETE_UPDATE_user_role2"
    FOREIGN KEY (role_id) REFERENCES nir_role(r_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index Nir_object_value_act_mask_fk0 (OID = 219248) :
--
ALTER TABLE ONLY nir_object_value_act_mask
    ADD CONSTRAINT "Nir_object_value_act_mask_fk0"
    FOREIGN KEY (vam_link_id) REFERENCES nir_links(l_id);
--
-- Definition for index cascade_delete_upadte__valuedate (OID = 219253) :
--
ALTER TABLE ONLY nir_object_value_datetime
    ADD CONSTRAINT cascade_delete_upadte__valuedate
    FOREIGN KEY (ovd_link_id) REFERENCES nir_links(l_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index cascade_delete_upadte__valueint (OID = 219258) :
--
ALTER TABLE ONLY nir_object_value_int
    ADD CONSTRAINT cascade_delete_upadte__valueint
    FOREIGN KEY (obi_link_id) REFERENCES nir_links(l_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index cascade_delete_upadte__valuevarchar (OID = 219263) :
--
ALTER TABLE ONLY nir_object_value_varchar
    ADD CONSTRAINT cascade_delete_upadte__valuevarchar
    FOREIGN KEY (ovv_link_id) REFERENCES nir_links(l_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_group_fk0 (OID = 219268) :
--
ALTER TABLE ONLY nir_group
    ADD CONSTRAINT nir_group_fk0
    FOREIGN KEY (id_object) REFERENCES nir_object(o_id);
--
-- Definition for index nir_group_user_fk0 (OID = 219273) :
--
ALTER TABLE ONLY nir_group_user
    ADD CONSTRAINT nir_group_user_fk0
    FOREIGN KEY (user_id) REFERENCES nir_user(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_group_user_fk1 (OID = 219278) :
--
ALTER TABLE ONLY nir_group_user
    ADD CONSTRAINT nir_group_user_fk1
    FOREIGN KEY (group_id) REFERENCES nir_group(group_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_links_fk0 (OID = 219283) :
--
ALTER TABLE ONLY nir_links
    ADD CONSTRAINT nir_links_fk0
    FOREIGN KEY (l_id1) REFERENCES nir_object(o_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_links_fk1 (OID = 219288) :
--
ALTER TABLE ONLY nir_links
    ADD CONSTRAINT nir_links_fk1
    FOREIGN KEY (l_id2) REFERENCES nir_object(o_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_links_fk2 (OID = 219293) :
--
ALTER TABLE ONLY nir_links
    ADD CONSTRAINT nir_links_fk2
    FOREIGN KEY (l_id_link_type) REFERENCES nir_link_type(lt_id);
--
-- Definition for index nir_links_fk3 (OID = 219298) :
--
ALTER TABLE ONLY nir_links
    ADD CONSTRAINT nir_links_fk3
    FOREIGN KEY (l_type_attr_id) REFERENCES nir_type_attr(ta_id);
--
-- Definition for index nir_links_fk3 (OID = 219303) :
--
ALTER TABLE ONLY rights_access
    ADD CONSTRAINT nir_links_fk3
    FOREIGN KEY (roa_id_subject) REFERENCES nir_object(o_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_links_fk3 (OID = 219308) :
--
ALTER TABLE ONLY rights_of_groups
    ADD CONSTRAINT nir_links_fk3
    FOREIGN KEY (rog_id_subject) REFERENCES nir_object(o_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_object_fk0 (OID = 219313) :
--
ALTER TABLE ONLY nir_object
    ADD CONSTRAINT nir_object_fk0
    FOREIGN KEY (o_id_type) REFERENCES nir_object_type(ot_id);
--
-- Definition for index nir_rights_of_access_fk3 (OID = 219318) :
--
ALTER TABLE ONLY rights_access
    ADD CONSTRAINT nir_rights_of_access_fk3
    FOREIGN KEY (roa_id_object) REFERENCES nir_object(o_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_rights_of_groups_fk3 (OID = 219323) :
--
ALTER TABLE ONLY rights_of_groups
    ADD CONSTRAINT nir_rights_of_groups_fk3
    FOREIGN KEY (rog_id_object) REFERENCES nir_object(o_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_role_access_real_fk1 (OID = 219328) :
--
ALTER TABLE ONLY role_obj_type
    ADD CONSTRAINT nir_role_access_real_fk1
    FOREIGN KEY (role_access_id_object_type) REFERENCES nir_object_type(ot_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_role_access_real_fk2 (OID = 219333) :
--
ALTER TABLE ONLY role_obj_type
    ADD CONSTRAINT nir_role_access_real_fk2
    FOREIGN KEY (role_id) REFERENCES nir_role(r_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index nir_role_r_parent_fkey (OID = 219338) :
--
ALTER TABLE ONLY nir_role
    ADD CONSTRAINT nir_role_r_parent_fkey
    FOREIGN KEY (r_parent) REFERENCES nir_role(r_id);
--
-- Definition for index CASCADE_DELETE_UPADTE__valueDate (OID = 219343) :
--
SET search_path = public, pg_catalog;
ALTER TABLE ONLY "Nir_object_value_date"
    ADD CONSTRAINT "CASCADE_DELETE_UPADTE__valueDate"
    FOREIGN KEY (ovd_link_id) REFERENCES "Nir_links"(l_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPADTE__valueInt (OID = 219348) :
--
ALTER TABLE ONLY "Nir_object_value_int"
    ADD CONSTRAINT "CASCADE_DELETE_UPADTE__valueInt"
    FOREIGN KEY (obi_link_id) REFERENCES "Nir_links"(l_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index CASCADE_DELETE_UPADTE__valueVarchar (OID = 219353) :
--
ALTER TABLE ONLY "Nir_object_value_varchar"
    ADD CONSTRAINT "CASCADE_DELETE_UPADTE__valueVarchar"
    FOREIGN KEY (ovv_link_id) REFERENCES "Nir_links"(l_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Definition for index Nir_links_fk0 (OID = 219358) :
--
ALTER TABLE ONLY "Nir_links"
    ADD CONSTRAINT "Nir_links_fk0"
    FOREIGN KEY (l_id1) REFERENCES "Nir_object"(o_id);
--
-- Definition for index Nir_links_fk1 (OID = 219363) :
--
ALTER TABLE ONLY "Nir_links"
    ADD CONSTRAINT "Nir_links_fk1"
    FOREIGN KEY (l_id2) REFERENCES "Nir_object"(o_id);
--
-- Definition for index Nir_links_fk2 (OID = 219368) :
--
ALTER TABLE ONLY "Nir_links"
    ADD CONSTRAINT "Nir_links_fk2"
    FOREIGN KEY (l_id_link_type) REFERENCES "Nir_link_type"(lt_id);
--
-- Definition for index Nir_object_fk0 (OID = 219373) :
--
ALTER TABLE ONLY "Nir_object"
    ADD CONSTRAINT "Nir_object_fk0"
    FOREIGN KEY (o_id_type) REFERENCES "Nir_object_type"(ot_id);
--
-- Definition for index Nir_object_value_date_fk0 (OID = 219378) :
--
ALTER TABLE ONLY "Nir_object_value_date"
    ADD CONSTRAINT "Nir_object_value_date_fk0"
    FOREIGN KEY (ovd_link_id) REFERENCES "Nir_links"(l_id);
--
-- Definition for index Nir_object_value_int_fk0 (OID = 219383) :
--
ALTER TABLE ONLY "Nir_object_value_int"
    ADD CONSTRAINT "Nir_object_value_int_fk0"
    FOREIGN KEY (obi_link_id) REFERENCES "Nir_links"(l_id);
--
-- Definition for index Nir_object_value_varchar_fk0 (OID = 219388) :
--
ALTER TABLE ONLY "Nir_object_value_varchar"
    ADD CONSTRAINT "Nir_object_value_varchar_fk0"
    FOREIGN KEY (ovv_link_id) REFERENCES "Nir_links"(l_id);
--
-- Definition for index Nir_role_action_fk0 (OID = 219393) :
--
ALTER TABLE ONLY "Nir_role_action"
    ADD CONSTRAINT "Nir_role_action_fk0"
    FOREIGN KEY (ra_role_id) REFERENCES "Nir_Role"(r_role_id);
--
-- Definition for index Nir_role_action_fk1 (OID = 219398) :
--
ALTER TABLE ONLY "Nir_role_action"
    ADD CONSTRAINT "Nir_role_action_fk1"
    FOREIGN KEY (ra_action_id) REFERENCES "Nir_Action"(a_action_id);
--
-- Definition for index Nir_role_action_fk2 (OID = 219403) :
--
ALTER TABLE ONLY "Nir_role_action"
    ADD CONSTRAINT "Nir_role_action_fk2"
    FOREIGN KEY (ra_object_id) REFERENCES "Nir_object"(o_id);
--
-- Definition for index Nir_user_role_fk0 (OID = 219408) :
--
ALTER TABLE ONLY "Nir_user_role"
    ADD CONSTRAINT "Nir_user_role_fk0"
    FOREIGN KEY (ur_role_id) REFERENCES "Nir_Role"(r_role_id);
--
-- Definition for index Nir_user_role_fk1 (OID = 219413) :
--
ALTER TABLE ONLY "Nir_user_role"
    ADD CONSTRAINT "Nir_user_role_fk1"
    FOREIGN KEY (ur_user_id) REFERENCES "Nir_User"("u_userId");
--
-- Definition for index user_id_object (OID = 219418) :
--
ALTER TABLE ONLY "Nir_User"
    ADD CONSTRAINT user_id_object
    FOREIGN KEY (u_id_object) REFERENCES "Nir_object"(o_id);
--
-- Comments
--
COMMENT ON SCHEMA public IS 'standard public schema';
