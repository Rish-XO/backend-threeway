CREATE DATABASE threeway
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


    CREATE TABLE public.users
(
    user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    firstname character varying(600),
    lastname character varying(600),
    email character varying(300),
    password character varying(600),
    role character varying(600),
    PRIMARY KEY (user_id)
);

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

    CREATE TABLE public.rooms
(
    room_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    post_id character varying NOT NULL,
    manufacturer character varying NOT NULL,
    transporter character varying NOT NULL,
    PRIMARY KEY (room_id)
);

ALTER TABLE IF EXISTS public.rooms
    OWNER to postgres;