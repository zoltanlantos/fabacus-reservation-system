import type Elysia from "elysia";

export type GetHandler = Parameters<Elysia['get']>[1]
export type PostHandler = Parameters<Elysia['post']>[1]
export type PutHandler = Parameters<Elysia['put']>[1]
