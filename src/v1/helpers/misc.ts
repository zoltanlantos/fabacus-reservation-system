import type Elysia from "elysia";

export type GetHandler = Parameters<Elysia['get']>
export type PostHandler = Parameters<Elysia['post']>
export type PutHandler = Parameters<Elysia['put']>
