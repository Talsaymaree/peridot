
/**
 * Client
**/

import * as runtime from './runtime/library';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions

export type PrismaPromise<T> = $Public.PrismaPromise<T>


export type UserPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  objects: {
    routines: RoutinePayload<ExtArgs>[]
  }
  scalars: $Extensions.GetResult<{
    id: string
    email: string
    name: string | null
    createdAt: Date
    updatedAt: Date
  }, ExtArgs["result"]["user"]>
  composites: {}
}

/**
 * Model User
 * 
 */
export type User = runtime.Types.DefaultSelection<UserPayload>
export type RoutinePayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  objects: {
    user: UserPayload<ExtArgs>
    regimens: RegimenPayload<ExtArgs>[]
  }
  scalars: $Extensions.GetResult<{
    id: string
    title: string
    description: string | null
    category: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    userId: string
  }, ExtArgs["result"]["routine"]>
  composites: {}
}

/**
 * Model Routine
 * 
 */
export type Routine = runtime.Types.DefaultSelection<RoutinePayload>
export type RegimenPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  objects: {
    routine: RoutinePayload<ExtArgs>
    tasks: TaskPayload<ExtArgs>[]
  }
  scalars: $Extensions.GetResult<{
    id: string
    title: string
    description: string | null
    cadence: string
    recurrenceType: string | null
    recurrenceDays: string | null
    createdAt: Date
    updatedAt: Date
    routineId: string
  }, ExtArgs["result"]["regimen"]>
  composites: {}
}

/**
 * Model Regimen
 * 
 */
export type Regimen = runtime.Types.DefaultSelection<RegimenPayload>
export type TaskPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  objects: {
    regimen: RegimenPayload<ExtArgs>
  }
  scalars: $Extensions.GetResult<{
    id: string
    title: string
    description: string | null
    priority: string
    status: string
    recurrenceType: string | null
    recurrenceDays: string | null
    dueDate: Date | null
    dueLabel: string | null
    dueBucket: string | null
    completedAt: Date | null
    referenceUrl: string | null
    referenceLabel: string | null
    referenceType: string | null
    createdAt: Date
    updatedAt: Date
    regimenId: string
  }, ExtArgs["result"]["task"]>
  composites: {}
}

/**
 * Model Task
 * 
 */
export type Task = runtime.Types.DefaultSelection<TaskPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  GlobalReject extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined = 'rejectOnNotFound' extends keyof T
    ? T['rejectOnNotFound']
    : false,
  ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => Promise<void> : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): Promise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => Promise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<R>


  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.routine`: Exposes CRUD operations for the **Routine** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Routines
    * const routines = await prisma.routine.findMany()
    * ```
    */
  get routine(): Prisma.RoutineDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.regimen`: Exposes CRUD operations for the **Regimen** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Regimen
    * const regimen = await prisma.regimen.findMany()
    * ```
    */
  get regimen(): Prisma.RegimenDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.task`: Exposes CRUD operations for the **Task** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tasks
    * const tasks = await prisma.task.findMany()
    * ```
    */
  get task(): Prisma.TaskDelegate<GlobalReject, ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export type Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export type Args<T, F extends $Public.Operation> = $Public.Args<T, F>
  export type Payload<T, F extends $Public.Operation> = $Public.Payload<T, F>
  export type Result<T, A, F extends $Public.Operation> = $Public.Result<T, A, F>
  export type Exact<T, W> = $Public.Exact<T, W>

  /**
   * Prisma Client JS version: 4.16.0
   * Query Engine version: b20ead4d3ab9e78ac112966e242ded703f4a052c
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }
  type HasSelect = {
    select: any
  }
  type HasInclude = {
    include: any
  }
  type CheckSelect<T, S, U> = T extends SelectAndInclude
    ? 'Please either choose `select` or `include`'
    : T extends HasSelect
    ? U
    : T extends HasInclude
    ? U
    : S

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but with an array
   */
  type PickArray<T, K extends Array<keyof T>> = Prisma__Pick<T, TupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Routine: 'Routine',
    Regimen: 'Regimen',
    Task: 'Task'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.Args}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
      meta: {
        modelProps: 'user' | 'routine' | 'regimen' | 'task'
        txIsolationLevel: Prisma.TransactionIsolationLevel
      },
      model: {
      User: {
        findUnique: {
          args: Prisma.UserFindUniqueArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        findUniqueOrThrow: {
          args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        findFirst: {
          args: Prisma.UserFindFirstArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        findFirstOrThrow: {
          args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        findMany: {
          args: Prisma.UserFindManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        create: {
          args: Prisma.UserCreateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        delete: {
          args: Prisma.UserDeleteArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        update: {
          args: Prisma.UserUpdateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        deleteMany: {
          args: Prisma.UserDeleteManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        updateMany: {
          args: Prisma.UserUpdateManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        upsert: {
          args: Prisma.UserUpsertArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        aggregate: {
          args: Prisma.UserAggregateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        groupBy: {
          args: Prisma.UserGroupByArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
        count: {
          args: Prisma.UserCountArgs<ExtArgs>,
          result: $Utils.OptionalFlat<User>
          payload: UserPayload<ExtArgs>
        }
      }
      Routine: {
        findUnique: {
          args: Prisma.RoutineFindUniqueArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        findUniqueOrThrow: {
          args: Prisma.RoutineFindUniqueOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        findFirst: {
          args: Prisma.RoutineFindFirstArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        findFirstOrThrow: {
          args: Prisma.RoutineFindFirstOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        findMany: {
          args: Prisma.RoutineFindManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        create: {
          args: Prisma.RoutineCreateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        delete: {
          args: Prisma.RoutineDeleteArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        update: {
          args: Prisma.RoutineUpdateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        deleteMany: {
          args: Prisma.RoutineDeleteManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        updateMany: {
          args: Prisma.RoutineUpdateManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        upsert: {
          args: Prisma.RoutineUpsertArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        aggregate: {
          args: Prisma.RoutineAggregateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        groupBy: {
          args: Prisma.RoutineGroupByArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
        count: {
          args: Prisma.RoutineCountArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Routine>
          payload: RoutinePayload<ExtArgs>
        }
      }
      Regimen: {
        findUnique: {
          args: Prisma.RegimenFindUniqueArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        findUniqueOrThrow: {
          args: Prisma.RegimenFindUniqueOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        findFirst: {
          args: Prisma.RegimenFindFirstArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        findFirstOrThrow: {
          args: Prisma.RegimenFindFirstOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        findMany: {
          args: Prisma.RegimenFindManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        create: {
          args: Prisma.RegimenCreateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        delete: {
          args: Prisma.RegimenDeleteArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        update: {
          args: Prisma.RegimenUpdateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        deleteMany: {
          args: Prisma.RegimenDeleteManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        updateMany: {
          args: Prisma.RegimenUpdateManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        upsert: {
          args: Prisma.RegimenUpsertArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        aggregate: {
          args: Prisma.RegimenAggregateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        groupBy: {
          args: Prisma.RegimenGroupByArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
        count: {
          args: Prisma.RegimenCountArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Regimen>
          payload: RegimenPayload<ExtArgs>
        }
      }
      Task: {
        findUnique: {
          args: Prisma.TaskFindUniqueArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        findUniqueOrThrow: {
          args: Prisma.TaskFindUniqueOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        findFirst: {
          args: Prisma.TaskFindFirstArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        findFirstOrThrow: {
          args: Prisma.TaskFindFirstOrThrowArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        findMany: {
          args: Prisma.TaskFindManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        create: {
          args: Prisma.TaskCreateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        delete: {
          args: Prisma.TaskDeleteArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        update: {
          args: Prisma.TaskUpdateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        deleteMany: {
          args: Prisma.TaskDeleteManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        updateMany: {
          args: Prisma.TaskUpdateManyArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        upsert: {
          args: Prisma.TaskUpsertArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        aggregate: {
          args: Prisma.TaskAggregateArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        groupBy: {
          args: Prisma.TaskGroupByArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
        count: {
          args: Prisma.TaskCountArgs<ExtArgs>,
          result: $Utils.OptionalFlat<Task>
          payload: TaskPayload<ExtArgs>
        }
      }
    }
  } & {
    other: {
      $executeRawUnsafe: {
        args: [query: string, ...values: any[]],
        result: any
        payload: any
      }
      $executeRaw: {
        args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
        result: any
        payload: any
      }
      $queryRawUnsafe: {
        args: [query: string, ...values: any[]],
        result: any
        payload: any
      }
      $queryRaw: {
        args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
        result: any
        payload: any
      }
    }
  }
    export const defineExtension: $Extensions.ExtendsHook<'define', Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type RejectOnNotFound = boolean | ((error: Error) => Error)
  export type RejectPerModel = { [P in ModelName]?: RejectOnNotFound }
  export type RejectPerOperation =  { [P in "findUnique" | "findFirst"]?: RejectPerModel | RejectOnNotFound } 
  type IsReject<T> = T extends true ? True : T extends (err: Error) => Error ? True : False
  export type HasReject<
    GlobalRejectSettings extends Prisma.PrismaClientOptions['rejectOnNotFound'],
    LocalRejectSettings,
    Action extends PrismaAction,
    Model extends ModelName
  > = LocalRejectSettings extends RejectOnNotFound
    ? IsReject<LocalRejectSettings>
    : GlobalRejectSettings extends RejectPerOperation
    ? Action extends keyof GlobalRejectSettings
      ? GlobalRejectSettings[Action] extends RejectOnNotFound
        ? IsReject<GlobalRejectSettings[Action]>
        : GlobalRejectSettings[Action] extends RejectPerModel
        ? Model extends keyof GlobalRejectSettings[Action]
          ? IsReject<GlobalRejectSettings[Action][Model]>
          : False
        : False
      : False
    : IsReject<GlobalRejectSettings>
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

  export interface PrismaClientOptions {
    /**
     * Configure findUnique/findFirst to throw an error if the query returns null. 
     * @deprecated since 4.0.0. Use `findUniqueOrThrow`/`findFirstOrThrow` methods instead.
     * @example
     * ```
     * // Reject on both findUnique/findFirst
     * rejectOnNotFound: true
     * // Reject only on findFirst with a custom error
     * rejectOnNotFound: { findFirst: (err) => new Error("Custom Error")}
     * // Reject on user.findUnique with a custom error
     * rejectOnNotFound: { findUnique: {User: (err) => new Error("User not found")}}
     * ```
     */
    rejectOnNotFound?: RejectOnNotFound | RejectPerOperation
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources

    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat

    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findMany'
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => Promise<T>,
  ) => Promise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */


  export type UserCountOutputType = {
    routines: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    routines?: boolean | UserCountOutputTypeCountRoutinesArgs
  }

  // Custom InputTypes

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRoutinesArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: RoutineWhereInput
  }



  /**
   * Count Type RoutineCountOutputType
   */


  export type RoutineCountOutputType = {
    regimens: number
  }

  export type RoutineCountOutputTypeSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    regimens?: boolean | RoutineCountOutputTypeCountRegimensArgs
  }

  // Custom InputTypes

  /**
   * RoutineCountOutputType without action
   */
  export type RoutineCountOutputTypeArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoutineCountOutputType
     */
    select?: RoutineCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * RoutineCountOutputType without action
   */
  export type RoutineCountOutputTypeCountRegimensArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: RegimenWhereInput
  }



  /**
   * Count Type RegimenCountOutputType
   */


  export type RegimenCountOutputType = {
    tasks: number
  }

  export type RegimenCountOutputTypeSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    tasks?: boolean | RegimenCountOutputTypeCountTasksArgs
  }

  // Custom InputTypes

  /**
   * RegimenCountOutputType without action
   */
  export type RegimenCountOutputTypeArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegimenCountOutputType
     */
    select?: RegimenCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * RegimenCountOutputType without action
   */
  export type RegimenCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }



  /**
   * Models
   */

  /**
   * Model User
   */


  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: Enumerable<UserOrderByWithAggregationInput>
    by: UserScalarFieldEnum[]
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }


  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    routines?: boolean | User$routinesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    routines?: boolean | User$routinesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeArgs<ExtArgs>
  }


  type UserGetPayload<S extends boolean | null | undefined | UserArgs> = $Types.GetResult<UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends UserFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'User'> extends True ? Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends UserFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'User'> extends True ? Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends UserFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<UserPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
    **/
    create<T extends UserCreateArgs<ExtArgs>>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
    **/
    delete<T extends UserDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends UserUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends UserDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends UserUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
    **/
    upsert<T extends UserUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    routines<T extends User$routinesArgs<ExtArgs> = {}>(args?: Subset<T, User$routinesArgs<ExtArgs>>): Prisma.PrismaPromise<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findMany', never>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * User base type for findUnique actions
   */
  export type UserFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUnique
   */
  export interface UserFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends UserFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User base type for findFirst actions
   */
  export type UserFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: Enumerable<UserScalarFieldEnum>
  }

  /**
   * User findFirst
   */
  export interface UserFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends UserFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: Enumerable<UserScalarFieldEnum>
  }


  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: Enumerable<UserScalarFieldEnum>
  }


  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }


  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }


  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }


  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }


  /**
   * User.routines
   */
  export type User$routinesArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    where?: RoutineWhereInput
    orderBy?: Enumerable<RoutineOrderByWithRelationInput>
    cursor?: RoutineWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<RoutineScalarFieldEnum>
  }


  /**
   * User without action
   */
  export type UserArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
  }



  /**
   * Model Routine
   */


  export type AggregateRoutine = {
    _count: RoutineCountAggregateOutputType | null
    _min: RoutineMinAggregateOutputType | null
    _max: RoutineMaxAggregateOutputType | null
  }

  export type RoutineMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    category: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type RoutineMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    category: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type RoutineCountAggregateOutputType = {
    id: number
    title: number
    description: number
    category: number
    isActive: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type RoutineMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type RoutineMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type RoutineCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type RoutineAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Routine to aggregate.
     */
    where?: RoutineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routines to fetch.
     */
    orderBy?: Enumerable<RoutineOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoutineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Routines
    **/
    _count?: true | RoutineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoutineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoutineMaxAggregateInputType
  }

  export type GetRoutineAggregateType<T extends RoutineAggregateArgs> = {
        [P in keyof T & keyof AggregateRoutine]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoutine[P]>
      : GetScalarType<T[P], AggregateRoutine[P]>
  }




  export type RoutineGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: RoutineWhereInput
    orderBy?: Enumerable<RoutineOrderByWithAggregationInput>
    by: RoutineScalarFieldEnum[]
    having?: RoutineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoutineCountAggregateInputType | true
    _min?: RoutineMinAggregateInputType
    _max?: RoutineMaxAggregateInputType
  }


  export type RoutineGroupByOutputType = {
    id: string
    title: string
    description: string | null
    category: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: RoutineCountAggregateOutputType | null
    _min: RoutineMinAggregateOutputType | null
    _max: RoutineMaxAggregateOutputType | null
  }

  type GetRoutineGroupByPayload<T extends RoutineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<RoutineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoutineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoutineGroupByOutputType[P]>
            : GetScalarType<T[P], RoutineGroupByOutputType[P]>
        }
      >
    >


  export type RoutineSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    user?: boolean | UserArgs<ExtArgs>
    regimens?: boolean | Routine$regimensArgs<ExtArgs>
    _count?: boolean | RoutineCountOutputTypeArgs<ExtArgs>
  }, ExtArgs["result"]["routine"]>

  export type RoutineSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type RoutineInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    user?: boolean | UserArgs<ExtArgs>
    regimens?: boolean | Routine$regimensArgs<ExtArgs>
    _count?: boolean | RoutineCountOutputTypeArgs<ExtArgs>
  }


  type RoutineGetPayload<S extends boolean | null | undefined | RoutineArgs> = $Types.GetResult<RoutinePayload, S>

  type RoutineCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<RoutineFindManyArgs, 'select' | 'include'> & {
      select?: RoutineCountAggregateInputType | true
    }

  export interface RoutineDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Routine'], meta: { name: 'Routine' } }
    /**
     * Find zero or one Routine that matches the filter.
     * @param {RoutineFindUniqueArgs} args - Arguments to find a Routine
     * @example
     * // Get one Routine
     * const routine = await prisma.routine.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends RoutineFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, RoutineFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Routine'> extends True ? Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one Routine that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {RoutineFindUniqueOrThrowArgs} args - Arguments to find a Routine
     * @example
     * // Get one Routine
     * const routine = await prisma.routine.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends RoutineFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, RoutineFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first Routine that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoutineFindFirstArgs} args - Arguments to find a Routine
     * @example
     * // Get one Routine
     * const routine = await prisma.routine.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends RoutineFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, RoutineFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Routine'> extends True ? Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first Routine that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoutineFindFirstOrThrowArgs} args - Arguments to find a Routine
     * @example
     * // Get one Routine
     * const routine = await prisma.routine.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends RoutineFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, RoutineFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more Routines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoutineFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Routines
     * const routines = await prisma.routine.findMany()
     * 
     * // Get first 10 Routines
     * const routines = await prisma.routine.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const routineWithIdOnly = await prisma.routine.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends RoutineFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, RoutineFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a Routine.
     * @param {RoutineCreateArgs} args - Arguments to create a Routine.
     * @example
     * // Create one Routine
     * const Routine = await prisma.routine.create({
     *   data: {
     *     // ... data to create a Routine
     *   }
     * })
     * 
    **/
    create<T extends RoutineCreateArgs<ExtArgs>>(
      args: SelectSubset<T, RoutineCreateArgs<ExtArgs>>
    ): Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Delete a Routine.
     * @param {RoutineDeleteArgs} args - Arguments to delete one Routine.
     * @example
     * // Delete one Routine
     * const Routine = await prisma.routine.delete({
     *   where: {
     *     // ... filter to delete one Routine
     *   }
     * })
     * 
    **/
    delete<T extends RoutineDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, RoutineDeleteArgs<ExtArgs>>
    ): Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one Routine.
     * @param {RoutineUpdateArgs} args - Arguments to update one Routine.
     * @example
     * // Update one Routine
     * const routine = await prisma.routine.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends RoutineUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, RoutineUpdateArgs<ExtArgs>>
    ): Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more Routines.
     * @param {RoutineDeleteManyArgs} args - Arguments to filter Routines to delete.
     * @example
     * // Delete a few Routines
     * const { count } = await prisma.routine.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends RoutineDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, RoutineDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Routines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoutineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Routines
     * const routine = await prisma.routine.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends RoutineUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, RoutineUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Routine.
     * @param {RoutineUpsertArgs} args - Arguments to update or create a Routine.
     * @example
     * // Update or create a Routine
     * const routine = await prisma.routine.upsert({
     *   create: {
     *     // ... data to create a Routine
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Routine we want to update
     *   }
     * })
    **/
    upsert<T extends RoutineUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, RoutineUpsertArgs<ExtArgs>>
    ): Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of Routines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoutineCountArgs} args - Arguments to filter Routines to count.
     * @example
     * // Count the number of Routines
     * const count = await prisma.routine.count({
     *   where: {
     *     // ... the filter for the Routines we want to count
     *   }
     * })
    **/
    count<T extends RoutineCountArgs>(
      args?: Subset<T, RoutineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoutineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Routine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoutineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoutineAggregateArgs>(args: Subset<T, RoutineAggregateArgs>): Prisma.PrismaPromise<GetRoutineAggregateType<T>>

    /**
     * Group by Routine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoutineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoutineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoutineGroupByArgs['orderBy'] }
        : { orderBy?: RoutineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoutineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoutineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Routine.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__RoutineClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs<ExtArgs> = {}>(args?: Subset<T, UserArgs<ExtArgs>>): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never> | Null, never, ExtArgs>;

    regimens<T extends Routine$regimensArgs<ExtArgs> = {}>(args?: Subset<T, Routine$regimensArgs<ExtArgs>>): Prisma.PrismaPromise<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findMany', never>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Routine base type for findUnique actions
   */
  export type RoutineFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * Filter, which Routine to fetch.
     */
    where: RoutineWhereUniqueInput
  }

  /**
   * Routine findUnique
   */
  export interface RoutineFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends RoutineFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Routine findUniqueOrThrow
   */
  export type RoutineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * Filter, which Routine to fetch.
     */
    where: RoutineWhereUniqueInput
  }


  /**
   * Routine base type for findFirst actions
   */
  export type RoutineFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * Filter, which Routine to fetch.
     */
    where?: RoutineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routines to fetch.
     */
    orderBy?: Enumerable<RoutineOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Routines.
     */
    cursor?: RoutineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Routines.
     */
    distinct?: Enumerable<RoutineScalarFieldEnum>
  }

  /**
   * Routine findFirst
   */
  export interface RoutineFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends RoutineFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Routine findFirstOrThrow
   */
  export type RoutineFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * Filter, which Routine to fetch.
     */
    where?: RoutineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routines to fetch.
     */
    orderBy?: Enumerable<RoutineOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Routines.
     */
    cursor?: RoutineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Routines.
     */
    distinct?: Enumerable<RoutineScalarFieldEnum>
  }


  /**
   * Routine findMany
   */
  export type RoutineFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * Filter, which Routines to fetch.
     */
    where?: RoutineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routines to fetch.
     */
    orderBy?: Enumerable<RoutineOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Routines.
     */
    cursor?: RoutineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routines.
     */
    skip?: number
    distinct?: Enumerable<RoutineScalarFieldEnum>
  }


  /**
   * Routine create
   */
  export type RoutineCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * The data needed to create a Routine.
     */
    data: XOR<RoutineCreateInput, RoutineUncheckedCreateInput>
  }


  /**
   * Routine update
   */
  export type RoutineUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * The data needed to update a Routine.
     */
    data: XOR<RoutineUpdateInput, RoutineUncheckedUpdateInput>
    /**
     * Choose, which Routine to update.
     */
    where: RoutineWhereUniqueInput
  }


  /**
   * Routine updateMany
   */
  export type RoutineUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Routines.
     */
    data: XOR<RoutineUpdateManyMutationInput, RoutineUncheckedUpdateManyInput>
    /**
     * Filter which Routines to update
     */
    where?: RoutineWhereInput
  }


  /**
   * Routine upsert
   */
  export type RoutineUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * The filter to search for the Routine to update in case it exists.
     */
    where: RoutineWhereUniqueInput
    /**
     * In case the Routine found by the `where` argument doesn't exist, create a new Routine with this data.
     */
    create: XOR<RoutineCreateInput, RoutineUncheckedCreateInput>
    /**
     * In case the Routine was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoutineUpdateInput, RoutineUncheckedUpdateInput>
  }


  /**
   * Routine delete
   */
  export type RoutineDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
    /**
     * Filter which Routine to delete.
     */
    where: RoutineWhereUniqueInput
  }


  /**
   * Routine deleteMany
   */
  export type RoutineDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Routines to delete
     */
    where?: RoutineWhereInput
  }


  /**
   * Routine.regimens
   */
  export type Routine$regimensArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    where?: RegimenWhereInput
    orderBy?: Enumerable<RegimenOrderByWithRelationInput>
    cursor?: RegimenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<RegimenScalarFieldEnum>
  }


  /**
   * Routine without action
   */
  export type RoutineArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Routine
     */
    select?: RoutineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RoutineInclude<ExtArgs> | null
  }



  /**
   * Model Regimen
   */


  export type AggregateRegimen = {
    _count: RegimenCountAggregateOutputType | null
    _min: RegimenMinAggregateOutputType | null
    _max: RegimenMaxAggregateOutputType | null
  }

  export type RegimenMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    cadence: string | null
    recurrenceType: string | null
    recurrenceDays: string | null
    createdAt: Date | null
    updatedAt: Date | null
    routineId: string | null
  }

  export type RegimenMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    cadence: string | null
    recurrenceType: string | null
    recurrenceDays: string | null
    createdAt: Date | null
    updatedAt: Date | null
    routineId: string | null
  }

  export type RegimenCountAggregateOutputType = {
    id: number
    title: number
    description: number
    cadence: number
    recurrenceType: number
    recurrenceDays: number
    createdAt: number
    updatedAt: number
    routineId: number
    _all: number
  }


  export type RegimenMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    cadence?: true
    recurrenceType?: true
    recurrenceDays?: true
    createdAt?: true
    updatedAt?: true
    routineId?: true
  }

  export type RegimenMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    cadence?: true
    recurrenceType?: true
    recurrenceDays?: true
    createdAt?: true
    updatedAt?: true
    routineId?: true
  }

  export type RegimenCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    cadence?: true
    recurrenceType?: true
    recurrenceDays?: true
    createdAt?: true
    updatedAt?: true
    routineId?: true
    _all?: true
  }

  export type RegimenAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Regimen to aggregate.
     */
    where?: RegimenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Regimen to fetch.
     */
    orderBy?: Enumerable<RegimenOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RegimenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Regimen from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Regimen.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Regimen
    **/
    _count?: true | RegimenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RegimenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RegimenMaxAggregateInputType
  }

  export type GetRegimenAggregateType<T extends RegimenAggregateArgs> = {
        [P in keyof T & keyof AggregateRegimen]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRegimen[P]>
      : GetScalarType<T[P], AggregateRegimen[P]>
  }




  export type RegimenGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: RegimenWhereInput
    orderBy?: Enumerable<RegimenOrderByWithAggregationInput>
    by: RegimenScalarFieldEnum[]
    having?: RegimenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RegimenCountAggregateInputType | true
    _min?: RegimenMinAggregateInputType
    _max?: RegimenMaxAggregateInputType
  }


  export type RegimenGroupByOutputType = {
    id: string
    title: string
    description: string | null
    cadence: string
    recurrenceType: string | null
    recurrenceDays: string | null
    createdAt: Date
    updatedAt: Date
    routineId: string
    _count: RegimenCountAggregateOutputType | null
    _min: RegimenMinAggregateOutputType | null
    _max: RegimenMaxAggregateOutputType | null
  }

  type GetRegimenGroupByPayload<T extends RegimenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<RegimenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RegimenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RegimenGroupByOutputType[P]>
            : GetScalarType<T[P], RegimenGroupByOutputType[P]>
        }
      >
    >


  export type RegimenSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    cadence?: boolean
    recurrenceType?: boolean
    recurrenceDays?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    routineId?: boolean
    routine?: boolean | RoutineArgs<ExtArgs>
    tasks?: boolean | Regimen$tasksArgs<ExtArgs>
    _count?: boolean | RegimenCountOutputTypeArgs<ExtArgs>
  }, ExtArgs["result"]["regimen"]>

  export type RegimenSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    cadence?: boolean
    recurrenceType?: boolean
    recurrenceDays?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    routineId?: boolean
  }

  export type RegimenInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    routine?: boolean | RoutineArgs<ExtArgs>
    tasks?: boolean | Regimen$tasksArgs<ExtArgs>
    _count?: boolean | RegimenCountOutputTypeArgs<ExtArgs>
  }


  type RegimenGetPayload<S extends boolean | null | undefined | RegimenArgs> = $Types.GetResult<RegimenPayload, S>

  type RegimenCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<RegimenFindManyArgs, 'select' | 'include'> & {
      select?: RegimenCountAggregateInputType | true
    }

  export interface RegimenDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Regimen'], meta: { name: 'Regimen' } }
    /**
     * Find zero or one Regimen that matches the filter.
     * @param {RegimenFindUniqueArgs} args - Arguments to find a Regimen
     * @example
     * // Get one Regimen
     * const regimen = await prisma.regimen.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends RegimenFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, RegimenFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Regimen'> extends True ? Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one Regimen that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {RegimenFindUniqueOrThrowArgs} args - Arguments to find a Regimen
     * @example
     * // Get one Regimen
     * const regimen = await prisma.regimen.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends RegimenFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, RegimenFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first Regimen that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegimenFindFirstArgs} args - Arguments to find a Regimen
     * @example
     * // Get one Regimen
     * const regimen = await prisma.regimen.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends RegimenFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, RegimenFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Regimen'> extends True ? Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first Regimen that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegimenFindFirstOrThrowArgs} args - Arguments to find a Regimen
     * @example
     * // Get one Regimen
     * const regimen = await prisma.regimen.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends RegimenFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, RegimenFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more Regimen that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegimenFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Regimen
     * const regimen = await prisma.regimen.findMany()
     * 
     * // Get first 10 Regimen
     * const regimen = await prisma.regimen.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const regimenWithIdOnly = await prisma.regimen.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends RegimenFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, RegimenFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a Regimen.
     * @param {RegimenCreateArgs} args - Arguments to create a Regimen.
     * @example
     * // Create one Regimen
     * const Regimen = await prisma.regimen.create({
     *   data: {
     *     // ... data to create a Regimen
     *   }
     * })
     * 
    **/
    create<T extends RegimenCreateArgs<ExtArgs>>(
      args: SelectSubset<T, RegimenCreateArgs<ExtArgs>>
    ): Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Delete a Regimen.
     * @param {RegimenDeleteArgs} args - Arguments to delete one Regimen.
     * @example
     * // Delete one Regimen
     * const Regimen = await prisma.regimen.delete({
     *   where: {
     *     // ... filter to delete one Regimen
     *   }
     * })
     * 
    **/
    delete<T extends RegimenDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, RegimenDeleteArgs<ExtArgs>>
    ): Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one Regimen.
     * @param {RegimenUpdateArgs} args - Arguments to update one Regimen.
     * @example
     * // Update one Regimen
     * const regimen = await prisma.regimen.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends RegimenUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, RegimenUpdateArgs<ExtArgs>>
    ): Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more Regimen.
     * @param {RegimenDeleteManyArgs} args - Arguments to filter Regimen to delete.
     * @example
     * // Delete a few Regimen
     * const { count } = await prisma.regimen.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends RegimenDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, RegimenDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Regimen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegimenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Regimen
     * const regimen = await prisma.regimen.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends RegimenUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, RegimenUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Regimen.
     * @param {RegimenUpsertArgs} args - Arguments to update or create a Regimen.
     * @example
     * // Update or create a Regimen
     * const regimen = await prisma.regimen.upsert({
     *   create: {
     *     // ... data to create a Regimen
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Regimen we want to update
     *   }
     * })
    **/
    upsert<T extends RegimenUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, RegimenUpsertArgs<ExtArgs>>
    ): Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of Regimen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegimenCountArgs} args - Arguments to filter Regimen to count.
     * @example
     * // Count the number of Regimen
     * const count = await prisma.regimen.count({
     *   where: {
     *     // ... the filter for the Regimen we want to count
     *   }
     * })
    **/
    count<T extends RegimenCountArgs>(
      args?: Subset<T, RegimenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RegimenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Regimen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegimenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RegimenAggregateArgs>(args: Subset<T, RegimenAggregateArgs>): Prisma.PrismaPromise<GetRegimenAggregateType<T>>

    /**
     * Group by Regimen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegimenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RegimenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RegimenGroupByArgs['orderBy'] }
        : { orderBy?: RegimenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RegimenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegimenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Regimen.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__RegimenClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    routine<T extends RoutineArgs<ExtArgs> = {}>(args?: Subset<T, RoutineArgs<ExtArgs>>): Prisma__RoutineClient<$Types.GetResult<RoutinePayload<ExtArgs>, T, 'findUnique', never> | Null, never, ExtArgs>;

    tasks<T extends Regimen$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Regimen$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findMany', never>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Regimen base type for findUnique actions
   */
  export type RegimenFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * Filter, which Regimen to fetch.
     */
    where: RegimenWhereUniqueInput
  }

  /**
   * Regimen findUnique
   */
  export interface RegimenFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends RegimenFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Regimen findUniqueOrThrow
   */
  export type RegimenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * Filter, which Regimen to fetch.
     */
    where: RegimenWhereUniqueInput
  }


  /**
   * Regimen base type for findFirst actions
   */
  export type RegimenFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * Filter, which Regimen to fetch.
     */
    where?: RegimenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Regimen to fetch.
     */
    orderBy?: Enumerable<RegimenOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Regimen.
     */
    cursor?: RegimenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Regimen from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Regimen.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Regimen.
     */
    distinct?: Enumerable<RegimenScalarFieldEnum>
  }

  /**
   * Regimen findFirst
   */
  export interface RegimenFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends RegimenFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Regimen findFirstOrThrow
   */
  export type RegimenFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * Filter, which Regimen to fetch.
     */
    where?: RegimenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Regimen to fetch.
     */
    orderBy?: Enumerable<RegimenOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Regimen.
     */
    cursor?: RegimenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Regimen from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Regimen.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Regimen.
     */
    distinct?: Enumerable<RegimenScalarFieldEnum>
  }


  /**
   * Regimen findMany
   */
  export type RegimenFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * Filter, which Regimen to fetch.
     */
    where?: RegimenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Regimen to fetch.
     */
    orderBy?: Enumerable<RegimenOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Regimen.
     */
    cursor?: RegimenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Regimen from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Regimen.
     */
    skip?: number
    distinct?: Enumerable<RegimenScalarFieldEnum>
  }


  /**
   * Regimen create
   */
  export type RegimenCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * The data needed to create a Regimen.
     */
    data: XOR<RegimenCreateInput, RegimenUncheckedCreateInput>
  }


  /**
   * Regimen update
   */
  export type RegimenUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * The data needed to update a Regimen.
     */
    data: XOR<RegimenUpdateInput, RegimenUncheckedUpdateInput>
    /**
     * Choose, which Regimen to update.
     */
    where: RegimenWhereUniqueInput
  }


  /**
   * Regimen updateMany
   */
  export type RegimenUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Regimen.
     */
    data: XOR<RegimenUpdateManyMutationInput, RegimenUncheckedUpdateManyInput>
    /**
     * Filter which Regimen to update
     */
    where?: RegimenWhereInput
  }


  /**
   * Regimen upsert
   */
  export type RegimenUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * The filter to search for the Regimen to update in case it exists.
     */
    where: RegimenWhereUniqueInput
    /**
     * In case the Regimen found by the `where` argument doesn't exist, create a new Regimen with this data.
     */
    create: XOR<RegimenCreateInput, RegimenUncheckedCreateInput>
    /**
     * In case the Regimen was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RegimenUpdateInput, RegimenUncheckedUpdateInput>
  }


  /**
   * Regimen delete
   */
  export type RegimenDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
    /**
     * Filter which Regimen to delete.
     */
    where: RegimenWhereUniqueInput
  }


  /**
   * Regimen deleteMany
   */
  export type RegimenDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Regimen to delete
     */
    where?: RegimenWhereInput
  }


  /**
   * Regimen.tasks
   */
  export type Regimen$tasksArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: Enumerable<TaskOrderByWithRelationInput>
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<TaskScalarFieldEnum>
  }


  /**
   * Regimen without action
   */
  export type RegimenArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Regimen
     */
    select?: RegimenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegimenInclude<ExtArgs> | null
  }



  /**
   * Model Task
   */


  export type AggregateTask = {
    _count: TaskCountAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  export type TaskMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    priority: string | null
    status: string | null
    recurrenceType: string | null
    recurrenceDays: string | null
    dueDate: Date | null
    dueLabel: string | null
    dueBucket: string | null
    completedAt: Date | null
    referenceUrl: string | null
    referenceLabel: string | null
    referenceType: string | null
    createdAt: Date | null
    updatedAt: Date | null
    regimenId: string | null
  }

  export type TaskMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    priority: string | null
    status: string | null
    recurrenceType: string | null
    recurrenceDays: string | null
    dueDate: Date | null
    dueLabel: string | null
    dueBucket: string | null
    completedAt: Date | null
    referenceUrl: string | null
    referenceLabel: string | null
    referenceType: string | null
    createdAt: Date | null
    updatedAt: Date | null
    regimenId: string | null
  }

  export type TaskCountAggregateOutputType = {
    id: number
    title: number
    description: number
    priority: number
    status: number
    recurrenceType: number
    recurrenceDays: number
    dueDate: number
    dueLabel: number
    dueBucket: number
    completedAt: number
    referenceUrl: number
    referenceLabel: number
    referenceType: number
    createdAt: number
    updatedAt: number
    regimenId: number
    _all: number
  }


  export type TaskMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    priority?: true
    status?: true
    recurrenceType?: true
    recurrenceDays?: true
    dueDate?: true
    dueLabel?: true
    dueBucket?: true
    completedAt?: true
    referenceUrl?: true
    referenceLabel?: true
    referenceType?: true
    createdAt?: true
    updatedAt?: true
    regimenId?: true
  }

  export type TaskMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    priority?: true
    status?: true
    recurrenceType?: true
    recurrenceDays?: true
    dueDate?: true
    dueLabel?: true
    dueBucket?: true
    completedAt?: true
    referenceUrl?: true
    referenceLabel?: true
    referenceType?: true
    createdAt?: true
    updatedAt?: true
    regimenId?: true
  }

  export type TaskCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    priority?: true
    status?: true
    recurrenceType?: true
    recurrenceDays?: true
    dueDate?: true
    dueLabel?: true
    dueBucket?: true
    completedAt?: true
    referenceUrl?: true
    referenceLabel?: true
    referenceType?: true
    createdAt?: true
    updatedAt?: true
    regimenId?: true
    _all?: true
  }

  export type TaskAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Task to aggregate.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: Enumerable<TaskOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tasks
    **/
    _count?: true | TaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaskMaxAggregateInputType
  }

  export type GetTaskAggregateType<T extends TaskAggregateArgs> = {
        [P in keyof T & keyof AggregateTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTask[P]>
      : GetScalarType<T[P], AggregateTask[P]>
  }




  export type TaskGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
    orderBy?: Enumerable<TaskOrderByWithAggregationInput>
    by: TaskScalarFieldEnum[]
    having?: TaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaskCountAggregateInputType | true
    _min?: TaskMinAggregateInputType
    _max?: TaskMaxAggregateInputType
  }


  export type TaskGroupByOutputType = {
    id: string
    title: string
    description: string | null
    priority: string
    status: string
    recurrenceType: string | null
    recurrenceDays: string | null
    dueDate: Date | null
    dueLabel: string | null
    dueBucket: string | null
    completedAt: Date | null
    referenceUrl: string | null
    referenceLabel: string | null
    referenceType: string | null
    createdAt: Date
    updatedAt: Date
    regimenId: string
    _count: TaskCountAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  type GetTaskGroupByPayload<T extends TaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<TaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaskGroupByOutputType[P]>
            : GetScalarType<T[P], TaskGroupByOutputType[P]>
        }
      >
    >


  export type TaskSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    priority?: boolean
    status?: boolean
    recurrenceType?: boolean
    recurrenceDays?: boolean
    dueDate?: boolean
    dueLabel?: boolean
    dueBucket?: boolean
    completedAt?: boolean
    referenceUrl?: boolean
    referenceLabel?: boolean
    referenceType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    regimenId?: boolean
    regimen?: boolean | RegimenArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    priority?: boolean
    status?: boolean
    recurrenceType?: boolean
    recurrenceDays?: boolean
    dueDate?: boolean
    dueLabel?: boolean
    dueBucket?: boolean
    completedAt?: boolean
    referenceUrl?: boolean
    referenceLabel?: boolean
    referenceType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    regimenId?: boolean
  }

  export type TaskInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    regimen?: boolean | RegimenArgs<ExtArgs>
  }


  type TaskGetPayload<S extends boolean | null | undefined | TaskArgs> = $Types.GetResult<TaskPayload, S>

  type TaskCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<TaskFindManyArgs, 'select' | 'include'> & {
      select?: TaskCountAggregateInputType | true
    }

  export interface TaskDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Task'], meta: { name: 'Task' } }
    /**
     * Find zero or one Task that matches the filter.
     * @param {TaskFindUniqueArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends TaskFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, TaskFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Task'> extends True ? Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one Task that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {TaskFindUniqueOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends TaskFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, TaskFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first Task that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends TaskFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, TaskFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Task'> extends True ? Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first Task that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends TaskFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, TaskFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more Tasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tasks
     * const tasks = await prisma.task.findMany()
     * 
     * // Get first 10 Tasks
     * const tasks = await prisma.task.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const taskWithIdOnly = await prisma.task.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends TaskFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, TaskFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<TaskPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a Task.
     * @param {TaskCreateArgs} args - Arguments to create a Task.
     * @example
     * // Create one Task
     * const Task = await prisma.task.create({
     *   data: {
     *     // ... data to create a Task
     *   }
     * })
     * 
    **/
    create<T extends TaskCreateArgs<ExtArgs>>(
      args: SelectSubset<T, TaskCreateArgs<ExtArgs>>
    ): Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Delete a Task.
     * @param {TaskDeleteArgs} args - Arguments to delete one Task.
     * @example
     * // Delete one Task
     * const Task = await prisma.task.delete({
     *   where: {
     *     // ... filter to delete one Task
     *   }
     * })
     * 
    **/
    delete<T extends TaskDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, TaskDeleteArgs<ExtArgs>>
    ): Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one Task.
     * @param {TaskUpdateArgs} args - Arguments to update one Task.
     * @example
     * // Update one Task
     * const task = await prisma.task.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends TaskUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, TaskUpdateArgs<ExtArgs>>
    ): Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more Tasks.
     * @param {TaskDeleteManyArgs} args - Arguments to filter Tasks to delete.
     * @example
     * // Delete a few Tasks
     * const { count } = await prisma.task.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends TaskDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, TaskDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tasks
     * const task = await prisma.task.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends TaskUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, TaskUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Task.
     * @param {TaskUpsertArgs} args - Arguments to update or create a Task.
     * @example
     * // Update or create a Task
     * const task = await prisma.task.upsert({
     *   create: {
     *     // ... data to create a Task
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Task we want to update
     *   }
     * })
    **/
    upsert<T extends TaskUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, TaskUpsertArgs<ExtArgs>>
    ): Prisma__TaskClient<$Types.GetResult<TaskPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskCountArgs} args - Arguments to filter Tasks to count.
     * @example
     * // Count the number of Tasks
     * const count = await prisma.task.count({
     *   where: {
     *     // ... the filter for the Tasks we want to count
     *   }
     * })
    **/
    count<T extends TaskCountArgs>(
      args?: Subset<T, TaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TaskAggregateArgs>(args: Subset<T, TaskAggregateArgs>): Prisma.PrismaPromise<GetTaskAggregateType<T>>

    /**
     * Group by Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaskGroupByArgs['orderBy'] }
        : { orderBy?: TaskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Task.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__TaskClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    regimen<T extends RegimenArgs<ExtArgs> = {}>(args?: Subset<T, RegimenArgs<ExtArgs>>): Prisma__RegimenClient<$Types.GetResult<RegimenPayload<ExtArgs>, T, 'findUnique', never> | Null, never, ExtArgs>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Task base type for findUnique actions
   */
  export type TaskFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task findUnique
   */
  export interface TaskFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends TaskFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Task findUniqueOrThrow
   */
  export type TaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }


  /**
   * Task base type for findFirst actions
   */
  export type TaskFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: Enumerable<TaskOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: Enumerable<TaskScalarFieldEnum>
  }

  /**
   * Task findFirst
   */
  export interface TaskFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends TaskFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Task findFirstOrThrow
   */
  export type TaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: Enumerable<TaskOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: Enumerable<TaskScalarFieldEnum>
  }


  /**
   * Task findMany
   */
  export type TaskFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Tasks to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: Enumerable<TaskOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    distinct?: Enumerable<TaskScalarFieldEnum>
  }


  /**
   * Task create
   */
  export type TaskCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to create a Task.
     */
    data: XOR<TaskCreateInput, TaskUncheckedCreateInput>
  }


  /**
   * Task update
   */
  export type TaskUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to update a Task.
     */
    data: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
    /**
     * Choose, which Task to update.
     */
    where: TaskWhereUniqueInput
  }


  /**
   * Task updateMany
   */
  export type TaskUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tasks.
     */
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyInput>
    /**
     * Filter which Tasks to update
     */
    where?: TaskWhereInput
  }


  /**
   * Task upsert
   */
  export type TaskUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The filter to search for the Task to update in case it exists.
     */
    where: TaskWhereUniqueInput
    /**
     * In case the Task found by the `where` argument doesn't exist, create a new Task with this data.
     */
    create: XOR<TaskCreateInput, TaskUncheckedCreateInput>
    /**
     * In case the Task was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
  }


  /**
   * Task delete
   */
  export type TaskDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter which Task to delete.
     */
    where: TaskWhereUniqueInput
  }


  /**
   * Task deleteMany
   */
  export type TaskDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tasks to delete
     */
    where?: TaskWhereInput
  }


  /**
   * Task without action
   */
  export type TaskArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TaskInclude<ExtArgs> | null
  }



  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const RoutineScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    category: 'category',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type RoutineScalarFieldEnum = (typeof RoutineScalarFieldEnum)[keyof typeof RoutineScalarFieldEnum]


  export const RegimenScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    cadence: 'cadence',
    recurrenceType: 'recurrenceType',
    recurrenceDays: 'recurrenceDays',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    routineId: 'routineId'
  };

  export type RegimenScalarFieldEnum = (typeof RegimenScalarFieldEnum)[keyof typeof RegimenScalarFieldEnum]


  export const TaskScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    priority: 'priority',
    status: 'status',
    recurrenceType: 'recurrenceType',
    recurrenceDays: 'recurrenceDays',
    dueDate: 'dueDate',
    dueLabel: 'dueLabel',
    dueBucket: 'dueBucket',
    completedAt: 'completedAt',
    referenceUrl: 'referenceUrl',
    referenceLabel: 'referenceLabel',
    referenceType: 'referenceType',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    regimenId: 'regimenId'
  };

  export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: Enumerable<UserWhereInput>
    OR?: Enumerable<UserWhereInput>
    NOT?: Enumerable<UserWhereInput>
    id?: StringFilter | string
    email?: StringFilter | string
    name?: StringNullableFilter | string | null
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    routines?: RoutineListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    routines?: RoutineOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = {
    id?: string
    email?: string
  }

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: Enumerable<UserScalarWhereWithAggregatesInput>
    OR?: Enumerable<UserScalarWhereWithAggregatesInput>
    NOT?: Enumerable<UserScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    email?: StringWithAggregatesFilter | string
    name?: StringNullableWithAggregatesFilter | string | null
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type RoutineWhereInput = {
    AND?: Enumerable<RoutineWhereInput>
    OR?: Enumerable<RoutineWhereInput>
    NOT?: Enumerable<RoutineWhereInput>
    id?: StringFilter | string
    title?: StringFilter | string
    description?: StringNullableFilter | string | null
    category?: StringFilter | string
    isActive?: BoolFilter | boolean
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: StringFilter | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    regimens?: RegimenListRelationFilter
  }

  export type RoutineOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    regimens?: RegimenOrderByRelationAggregateInput
  }

  export type RoutineWhereUniqueInput = {
    id?: string
  }

  export type RoutineOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: RoutineCountOrderByAggregateInput
    _max?: RoutineMaxOrderByAggregateInput
    _min?: RoutineMinOrderByAggregateInput
  }

  export type RoutineScalarWhereWithAggregatesInput = {
    AND?: Enumerable<RoutineScalarWhereWithAggregatesInput>
    OR?: Enumerable<RoutineScalarWhereWithAggregatesInput>
    NOT?: Enumerable<RoutineScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    title?: StringWithAggregatesFilter | string
    description?: StringNullableWithAggregatesFilter | string | null
    category?: StringWithAggregatesFilter | string
    isActive?: BoolWithAggregatesFilter | boolean
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    userId?: StringWithAggregatesFilter | string
  }

  export type RegimenWhereInput = {
    AND?: Enumerable<RegimenWhereInput>
    OR?: Enumerable<RegimenWhereInput>
    NOT?: Enumerable<RegimenWhereInput>
    id?: StringFilter | string
    title?: StringFilter | string
    description?: StringNullableFilter | string | null
    cadence?: StringFilter | string
    recurrenceType?: StringNullableFilter | string | null
    recurrenceDays?: StringNullableFilter | string | null
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    routineId?: StringFilter | string
    routine?: XOR<RoutineRelationFilter, RoutineWhereInput>
    tasks?: TaskListRelationFilter
  }

  export type RegimenOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    cadence?: SortOrder
    recurrenceType?: SortOrderInput | SortOrder
    recurrenceDays?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    routineId?: SortOrder
    routine?: RoutineOrderByWithRelationInput
    tasks?: TaskOrderByRelationAggregateInput
  }

  export type RegimenWhereUniqueInput = {
    id?: string
  }

  export type RegimenOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    cadence?: SortOrder
    recurrenceType?: SortOrderInput | SortOrder
    recurrenceDays?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    routineId?: SortOrder
    _count?: RegimenCountOrderByAggregateInput
    _max?: RegimenMaxOrderByAggregateInput
    _min?: RegimenMinOrderByAggregateInput
  }

  export type RegimenScalarWhereWithAggregatesInput = {
    AND?: Enumerable<RegimenScalarWhereWithAggregatesInput>
    OR?: Enumerable<RegimenScalarWhereWithAggregatesInput>
    NOT?: Enumerable<RegimenScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    title?: StringWithAggregatesFilter | string
    description?: StringNullableWithAggregatesFilter | string | null
    cadence?: StringWithAggregatesFilter | string
    recurrenceType?: StringNullableWithAggregatesFilter | string | null
    recurrenceDays?: StringNullableWithAggregatesFilter | string | null
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    routineId?: StringWithAggregatesFilter | string
  }

  export type TaskWhereInput = {
    AND?: Enumerable<TaskWhereInput>
    OR?: Enumerable<TaskWhereInput>
    NOT?: Enumerable<TaskWhereInput>
    id?: StringFilter | string
    title?: StringFilter | string
    description?: StringNullableFilter | string | null
    priority?: StringFilter | string
    status?: StringFilter | string
    recurrenceType?: StringNullableFilter | string | null
    recurrenceDays?: StringNullableFilter | string | null
    dueDate?: DateTimeNullableFilter | Date | string | null
    dueLabel?: StringNullableFilter | string | null
    dueBucket?: StringNullableFilter | string | null
    completedAt?: DateTimeNullableFilter | Date | string | null
    referenceUrl?: StringNullableFilter | string | null
    referenceLabel?: StringNullableFilter | string | null
    referenceType?: StringNullableFilter | string | null
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    regimenId?: StringFilter | string
    regimen?: XOR<RegimenRelationFilter, RegimenWhereInput>
  }

  export type TaskOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    priority?: SortOrder
    status?: SortOrder
    recurrenceType?: SortOrderInput | SortOrder
    recurrenceDays?: SortOrderInput | SortOrder
    dueDate?: SortOrderInput | SortOrder
    dueLabel?: SortOrderInput | SortOrder
    dueBucket?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    referenceUrl?: SortOrderInput | SortOrder
    referenceLabel?: SortOrderInput | SortOrder
    referenceType?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    regimenId?: SortOrder
    regimen?: RegimenOrderByWithRelationInput
  }

  export type TaskWhereUniqueInput = {
    id?: string
  }

  export type TaskOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    priority?: SortOrder
    status?: SortOrder
    recurrenceType?: SortOrderInput | SortOrder
    recurrenceDays?: SortOrderInput | SortOrder
    dueDate?: SortOrderInput | SortOrder
    dueLabel?: SortOrderInput | SortOrder
    dueBucket?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    referenceUrl?: SortOrderInput | SortOrder
    referenceLabel?: SortOrderInput | SortOrder
    referenceType?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    regimenId?: SortOrder
    _count?: TaskCountOrderByAggregateInput
    _max?: TaskMaxOrderByAggregateInput
    _min?: TaskMinOrderByAggregateInput
  }

  export type TaskScalarWhereWithAggregatesInput = {
    AND?: Enumerable<TaskScalarWhereWithAggregatesInput>
    OR?: Enumerable<TaskScalarWhereWithAggregatesInput>
    NOT?: Enumerable<TaskScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    title?: StringWithAggregatesFilter | string
    description?: StringNullableWithAggregatesFilter | string | null
    priority?: StringWithAggregatesFilter | string
    status?: StringWithAggregatesFilter | string
    recurrenceType?: StringNullableWithAggregatesFilter | string | null
    recurrenceDays?: StringNullableWithAggregatesFilter | string | null
    dueDate?: DateTimeNullableWithAggregatesFilter | Date | string | null
    dueLabel?: StringNullableWithAggregatesFilter | string | null
    dueBucket?: StringNullableWithAggregatesFilter | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter | Date | string | null
    referenceUrl?: StringNullableWithAggregatesFilter | string | null
    referenceLabel?: StringNullableWithAggregatesFilter | string | null
    referenceType?: StringNullableWithAggregatesFilter | string | null
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    regimenId?: StringWithAggregatesFilter | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    routines?: RoutineCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    routines?: RoutineUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routines?: RoutineUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routines?: RoutineUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoutineCreateInput = {
    id?: string
    title: string
    description?: string | null
    category?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutRoutinesInput
    regimens?: RegimenCreateNestedManyWithoutRoutineInput
  }

  export type RoutineUncheckedCreateInput = {
    id?: string
    title: string
    description?: string | null
    category?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    regimens?: RegimenUncheckedCreateNestedManyWithoutRoutineInput
  }

  export type RoutineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutRoutinesNestedInput
    regimens?: RegimenUpdateManyWithoutRoutineNestedInput
  }

  export type RoutineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    regimens?: RegimenUncheckedUpdateManyWithoutRoutineNestedInput
  }

  export type RoutineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoutineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type RegimenCreateInput = {
    id?: string
    title: string
    description?: string | null
    cadence?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    routine: RoutineCreateNestedOneWithoutRegimensInput
    tasks?: TaskCreateNestedManyWithoutRegimenInput
  }

  export type RegimenUncheckedCreateInput = {
    id?: string
    title: string
    description?: string | null
    cadence?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    routineId: string
    tasks?: TaskUncheckedCreateNestedManyWithoutRegimenInput
  }

  export type RegimenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routine?: RoutineUpdateOneRequiredWithoutRegimensNestedInput
    tasks?: TaskUpdateManyWithoutRegimenNestedInput
  }

  export type RegimenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routineId?: StringFieldUpdateOperationsInput | string
    tasks?: TaskUncheckedUpdateManyWithoutRegimenNestedInput
  }

  export type RegimenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RegimenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routineId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskCreateInput = {
    id?: string
    title: string
    description?: string | null
    priority?: string
    status?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    dueDate?: Date | string | null
    dueLabel?: string | null
    dueBucket?: string | null
    completedAt?: Date | string | null
    referenceUrl?: string | null
    referenceLabel?: string | null
    referenceType?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    regimen: RegimenCreateNestedOneWithoutTasksInput
  }

  export type TaskUncheckedCreateInput = {
    id?: string
    title: string
    description?: string | null
    priority?: string
    status?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    dueDate?: Date | string | null
    dueLabel?: string | null
    dueBucket?: string | null
    completedAt?: Date | string | null
    referenceUrl?: string | null
    referenceLabel?: string | null
    referenceType?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    regimenId: string
  }

  export type TaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dueLabel?: NullableStringFieldUpdateOperationsInput | string | null
    dueBucket?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    referenceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    referenceLabel?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    regimen?: RegimenUpdateOneRequiredWithoutTasksNestedInput
  }

  export type TaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dueLabel?: NullableStringFieldUpdateOperationsInput | string | null
    dueBucket?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    referenceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    referenceLabel?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    regimenId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dueLabel?: NullableStringFieldUpdateOperationsInput | string | null
    dueBucket?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    referenceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    referenceLabel?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dueLabel?: NullableStringFieldUpdateOperationsInput | string | null
    dueBucket?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    referenceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    referenceLabel?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    regimenId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type StringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | string | null
    notIn?: Enumerable<string> | string | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableFilter | string | null
  }

  export type DateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type RoutineListRelationFilter = {
    every?: RoutineWhereInput
    some?: RoutineWhereInput
    none?: RoutineWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RoutineOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type StringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | string | null
    notIn?: Enumerable<string> | string | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type DateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type BoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type UserRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type RegimenListRelationFilter = {
    every?: RegimenWhereInput
    some?: RegimenWhereInput
    none?: RegimenWhereInput
  }

  export type RegimenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RoutineCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type RoutineMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type RoutineMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type BoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type RoutineRelationFilter = {
    is?: RoutineWhereInput | null
    isNot?: RoutineWhereInput | null
  }

  export type TaskListRelationFilter = {
    every?: TaskWhereInput
    some?: TaskWhereInput
    none?: TaskWhereInput
  }

  export type TaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RegimenCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    cadence?: SortOrder
    recurrenceType?: SortOrder
    recurrenceDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    routineId?: SortOrder
  }

  export type RegimenMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    cadence?: SortOrder
    recurrenceType?: SortOrder
    recurrenceDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    routineId?: SortOrder
  }

  export type RegimenMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    cadence?: SortOrder
    recurrenceType?: SortOrder
    recurrenceDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    routineId?: SortOrder
  }

  export type DateTimeNullableFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | Date | string | null
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableFilter | Date | string | null
  }

  export type RegimenRelationFilter = {
    is?: RegimenWhereInput | null
    isNot?: RegimenWhereInput | null
  }

  export type TaskCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    recurrenceType?: SortOrder
    recurrenceDays?: SortOrder
    dueDate?: SortOrder
    dueLabel?: SortOrder
    dueBucket?: SortOrder
    completedAt?: SortOrder
    referenceUrl?: SortOrder
    referenceLabel?: SortOrder
    referenceType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    regimenId?: SortOrder
  }

  export type TaskMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    recurrenceType?: SortOrder
    recurrenceDays?: SortOrder
    dueDate?: SortOrder
    dueLabel?: SortOrder
    dueBucket?: SortOrder
    completedAt?: SortOrder
    referenceUrl?: SortOrder
    referenceLabel?: SortOrder
    referenceType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    regimenId?: SortOrder
  }

  export type TaskMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    recurrenceType?: SortOrder
    recurrenceDays?: SortOrder
    dueDate?: SortOrder
    dueLabel?: SortOrder
    dueBucket?: SortOrder
    completedAt?: SortOrder
    referenceUrl?: SortOrder
    referenceLabel?: SortOrder
    referenceType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    regimenId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | Date | string | null
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableWithAggregatesFilter | Date | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedDateTimeNullableFilter
    _max?: NestedDateTimeNullableFilter
  }

  export type RoutineCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<RoutineCreateWithoutUserInput>, Enumerable<RoutineUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<RoutineCreateOrConnectWithoutUserInput>
    connect?: Enumerable<RoutineWhereUniqueInput>
  }

  export type RoutineUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<RoutineCreateWithoutUserInput>, Enumerable<RoutineUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<RoutineCreateOrConnectWithoutUserInput>
    connect?: Enumerable<RoutineWhereUniqueInput>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type RoutineUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<RoutineCreateWithoutUserInput>, Enumerable<RoutineUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<RoutineCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<RoutineUpsertWithWhereUniqueWithoutUserInput>
    set?: Enumerable<RoutineWhereUniqueInput>
    disconnect?: Enumerable<RoutineWhereUniqueInput>
    delete?: Enumerable<RoutineWhereUniqueInput>
    connect?: Enumerable<RoutineWhereUniqueInput>
    update?: Enumerable<RoutineUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<RoutineUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<RoutineScalarWhereInput>
  }

  export type RoutineUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<RoutineCreateWithoutUserInput>, Enumerable<RoutineUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<RoutineCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<RoutineUpsertWithWhereUniqueWithoutUserInput>
    set?: Enumerable<RoutineWhereUniqueInput>
    disconnect?: Enumerable<RoutineWhereUniqueInput>
    delete?: Enumerable<RoutineWhereUniqueInput>
    connect?: Enumerable<RoutineWhereUniqueInput>
    update?: Enumerable<RoutineUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<RoutineUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<RoutineScalarWhereInput>
  }

  export type UserCreateNestedOneWithoutRoutinesInput = {
    create?: XOR<UserCreateWithoutRoutinesInput, UserUncheckedCreateWithoutRoutinesInput>
    connectOrCreate?: UserCreateOrConnectWithoutRoutinesInput
    connect?: UserWhereUniqueInput
  }

  export type RegimenCreateNestedManyWithoutRoutineInput = {
    create?: XOR<Enumerable<RegimenCreateWithoutRoutineInput>, Enumerable<RegimenUncheckedCreateWithoutRoutineInput>>
    connectOrCreate?: Enumerable<RegimenCreateOrConnectWithoutRoutineInput>
    connect?: Enumerable<RegimenWhereUniqueInput>
  }

  export type RegimenUncheckedCreateNestedManyWithoutRoutineInput = {
    create?: XOR<Enumerable<RegimenCreateWithoutRoutineInput>, Enumerable<RegimenUncheckedCreateWithoutRoutineInput>>
    connectOrCreate?: Enumerable<RegimenCreateOrConnectWithoutRoutineInput>
    connect?: Enumerable<RegimenWhereUniqueInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutRoutinesNestedInput = {
    create?: XOR<UserCreateWithoutRoutinesInput, UserUncheckedCreateWithoutRoutinesInput>
    connectOrCreate?: UserCreateOrConnectWithoutRoutinesInput
    upsert?: UserUpsertWithoutRoutinesInput
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutRoutinesInput, UserUncheckedUpdateWithoutRoutinesInput>
  }

  export type RegimenUpdateManyWithoutRoutineNestedInput = {
    create?: XOR<Enumerable<RegimenCreateWithoutRoutineInput>, Enumerable<RegimenUncheckedCreateWithoutRoutineInput>>
    connectOrCreate?: Enumerable<RegimenCreateOrConnectWithoutRoutineInput>
    upsert?: Enumerable<RegimenUpsertWithWhereUniqueWithoutRoutineInput>
    set?: Enumerable<RegimenWhereUniqueInput>
    disconnect?: Enumerable<RegimenWhereUniqueInput>
    delete?: Enumerable<RegimenWhereUniqueInput>
    connect?: Enumerable<RegimenWhereUniqueInput>
    update?: Enumerable<RegimenUpdateWithWhereUniqueWithoutRoutineInput>
    updateMany?: Enumerable<RegimenUpdateManyWithWhereWithoutRoutineInput>
    deleteMany?: Enumerable<RegimenScalarWhereInput>
  }

  export type RegimenUncheckedUpdateManyWithoutRoutineNestedInput = {
    create?: XOR<Enumerable<RegimenCreateWithoutRoutineInput>, Enumerable<RegimenUncheckedCreateWithoutRoutineInput>>
    connectOrCreate?: Enumerable<RegimenCreateOrConnectWithoutRoutineInput>
    upsert?: Enumerable<RegimenUpsertWithWhereUniqueWithoutRoutineInput>
    set?: Enumerable<RegimenWhereUniqueInput>
    disconnect?: Enumerable<RegimenWhereUniqueInput>
    delete?: Enumerable<RegimenWhereUniqueInput>
    connect?: Enumerable<RegimenWhereUniqueInput>
    update?: Enumerable<RegimenUpdateWithWhereUniqueWithoutRoutineInput>
    updateMany?: Enumerable<RegimenUpdateManyWithWhereWithoutRoutineInput>
    deleteMany?: Enumerable<RegimenScalarWhereInput>
  }

  export type RoutineCreateNestedOneWithoutRegimensInput = {
    create?: XOR<RoutineCreateWithoutRegimensInput, RoutineUncheckedCreateWithoutRegimensInput>
    connectOrCreate?: RoutineCreateOrConnectWithoutRegimensInput
    connect?: RoutineWhereUniqueInput
  }

  export type TaskCreateNestedManyWithoutRegimenInput = {
    create?: XOR<Enumerable<TaskCreateWithoutRegimenInput>, Enumerable<TaskUncheckedCreateWithoutRegimenInput>>
    connectOrCreate?: Enumerable<TaskCreateOrConnectWithoutRegimenInput>
    connect?: Enumerable<TaskWhereUniqueInput>
  }

  export type TaskUncheckedCreateNestedManyWithoutRegimenInput = {
    create?: XOR<Enumerable<TaskCreateWithoutRegimenInput>, Enumerable<TaskUncheckedCreateWithoutRegimenInput>>
    connectOrCreate?: Enumerable<TaskCreateOrConnectWithoutRegimenInput>
    connect?: Enumerable<TaskWhereUniqueInput>
  }

  export type RoutineUpdateOneRequiredWithoutRegimensNestedInput = {
    create?: XOR<RoutineCreateWithoutRegimensInput, RoutineUncheckedCreateWithoutRegimensInput>
    connectOrCreate?: RoutineCreateOrConnectWithoutRegimensInput
    upsert?: RoutineUpsertWithoutRegimensInput
    connect?: RoutineWhereUniqueInput
    update?: XOR<RoutineUpdateWithoutRegimensInput, RoutineUncheckedUpdateWithoutRegimensInput>
  }

  export type TaskUpdateManyWithoutRegimenNestedInput = {
    create?: XOR<Enumerable<TaskCreateWithoutRegimenInput>, Enumerable<TaskUncheckedCreateWithoutRegimenInput>>
    connectOrCreate?: Enumerable<TaskCreateOrConnectWithoutRegimenInput>
    upsert?: Enumerable<TaskUpsertWithWhereUniqueWithoutRegimenInput>
    set?: Enumerable<TaskWhereUniqueInput>
    disconnect?: Enumerable<TaskWhereUniqueInput>
    delete?: Enumerable<TaskWhereUniqueInput>
    connect?: Enumerable<TaskWhereUniqueInput>
    update?: Enumerable<TaskUpdateWithWhereUniqueWithoutRegimenInput>
    updateMany?: Enumerable<TaskUpdateManyWithWhereWithoutRegimenInput>
    deleteMany?: Enumerable<TaskScalarWhereInput>
  }

  export type TaskUncheckedUpdateManyWithoutRegimenNestedInput = {
    create?: XOR<Enumerable<TaskCreateWithoutRegimenInput>, Enumerable<TaskUncheckedCreateWithoutRegimenInput>>
    connectOrCreate?: Enumerable<TaskCreateOrConnectWithoutRegimenInput>
    upsert?: Enumerable<TaskUpsertWithWhereUniqueWithoutRegimenInput>
    set?: Enumerable<TaskWhereUniqueInput>
    disconnect?: Enumerable<TaskWhereUniqueInput>
    delete?: Enumerable<TaskWhereUniqueInput>
    connect?: Enumerable<TaskWhereUniqueInput>
    update?: Enumerable<TaskUpdateWithWhereUniqueWithoutRegimenInput>
    updateMany?: Enumerable<TaskUpdateManyWithWhereWithoutRegimenInput>
    deleteMany?: Enumerable<TaskScalarWhereInput>
  }

  export type RegimenCreateNestedOneWithoutTasksInput = {
    create?: XOR<RegimenCreateWithoutTasksInput, RegimenUncheckedCreateWithoutTasksInput>
    connectOrCreate?: RegimenCreateOrConnectWithoutTasksInput
    connect?: RegimenWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type RegimenUpdateOneRequiredWithoutTasksNestedInput = {
    create?: XOR<RegimenCreateWithoutTasksInput, RegimenUncheckedCreateWithoutTasksInput>
    connectOrCreate?: RegimenCreateOrConnectWithoutTasksInput
    upsert?: RegimenUpsertWithoutTasksInput
    connect?: RegimenWhereUniqueInput
    update?: XOR<RegimenUpdateWithoutTasksInput, RegimenUncheckedUpdateWithoutTasksInput>
  }

  export type NestedStringFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type NestedStringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | string | null
    notIn?: Enumerable<string> | string | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableFilter | string | null
  }

  export type NestedDateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type NestedStringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type NestedIntFilter = {
    equals?: number
    in?: Enumerable<number> | number
    notIn?: Enumerable<number> | number
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type NestedStringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | string | null
    notIn?: Enumerable<string> | string | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type NestedIntNullableFilter = {
    equals?: number | null
    in?: Enumerable<number> | number | null
    notIn?: Enumerable<number> | number | null
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntNullableFilter | number | null
  }

  export type NestedDateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type NestedBoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type NestedBoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type NestedDateTimeNullableFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | Date | string | null
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableFilter | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | Date | string | null
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableWithAggregatesFilter | Date | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedDateTimeNullableFilter
    _max?: NestedDateTimeNullableFilter
  }

  export type RoutineCreateWithoutUserInput = {
    id?: string
    title: string
    description?: string | null
    category?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    regimens?: RegimenCreateNestedManyWithoutRoutineInput
  }

  export type RoutineUncheckedCreateWithoutUserInput = {
    id?: string
    title: string
    description?: string | null
    category?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    regimens?: RegimenUncheckedCreateNestedManyWithoutRoutineInput
  }

  export type RoutineCreateOrConnectWithoutUserInput = {
    where: RoutineWhereUniqueInput
    create: XOR<RoutineCreateWithoutUserInput, RoutineUncheckedCreateWithoutUserInput>
  }

  export type RoutineUpsertWithWhereUniqueWithoutUserInput = {
    where: RoutineWhereUniqueInput
    update: XOR<RoutineUpdateWithoutUserInput, RoutineUncheckedUpdateWithoutUserInput>
    create: XOR<RoutineCreateWithoutUserInput, RoutineUncheckedCreateWithoutUserInput>
  }

  export type RoutineUpdateWithWhereUniqueWithoutUserInput = {
    where: RoutineWhereUniqueInput
    data: XOR<RoutineUpdateWithoutUserInput, RoutineUncheckedUpdateWithoutUserInput>
  }

  export type RoutineUpdateManyWithWhereWithoutUserInput = {
    where: RoutineScalarWhereInput
    data: XOR<RoutineUpdateManyMutationInput, RoutineUncheckedUpdateManyWithoutRoutinesInput>
  }

  export type RoutineScalarWhereInput = {
    AND?: Enumerable<RoutineScalarWhereInput>
    OR?: Enumerable<RoutineScalarWhereInput>
    NOT?: Enumerable<RoutineScalarWhereInput>
    id?: StringFilter | string
    title?: StringFilter | string
    description?: StringNullableFilter | string | null
    category?: StringFilter | string
    isActive?: BoolFilter | boolean
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: StringFilter | string
  }

  export type UserCreateWithoutRoutinesInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutRoutinesInput = {
    id?: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutRoutinesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRoutinesInput, UserUncheckedCreateWithoutRoutinesInput>
  }

  export type RegimenCreateWithoutRoutineInput = {
    id?: string
    title: string
    description?: string | null
    cadence?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: TaskCreateNestedManyWithoutRegimenInput
  }

  export type RegimenUncheckedCreateWithoutRoutineInput = {
    id?: string
    title: string
    description?: string | null
    cadence?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutRegimenInput
  }

  export type RegimenCreateOrConnectWithoutRoutineInput = {
    where: RegimenWhereUniqueInput
    create: XOR<RegimenCreateWithoutRoutineInput, RegimenUncheckedCreateWithoutRoutineInput>
  }

  export type UserUpsertWithoutRoutinesInput = {
    update: XOR<UserUpdateWithoutRoutinesInput, UserUncheckedUpdateWithoutRoutinesInput>
    create: XOR<UserCreateWithoutRoutinesInput, UserUncheckedCreateWithoutRoutinesInput>
  }

  export type UserUpdateWithoutRoutinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutRoutinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RegimenUpsertWithWhereUniqueWithoutRoutineInput = {
    where: RegimenWhereUniqueInput
    update: XOR<RegimenUpdateWithoutRoutineInput, RegimenUncheckedUpdateWithoutRoutineInput>
    create: XOR<RegimenCreateWithoutRoutineInput, RegimenUncheckedCreateWithoutRoutineInput>
  }

  export type RegimenUpdateWithWhereUniqueWithoutRoutineInput = {
    where: RegimenWhereUniqueInput
    data: XOR<RegimenUpdateWithoutRoutineInput, RegimenUncheckedUpdateWithoutRoutineInput>
  }

  export type RegimenUpdateManyWithWhereWithoutRoutineInput = {
    where: RegimenScalarWhereInput
    data: XOR<RegimenUpdateManyMutationInput, RegimenUncheckedUpdateManyWithoutRegimensInput>
  }

  export type RegimenScalarWhereInput = {
    AND?: Enumerable<RegimenScalarWhereInput>
    OR?: Enumerable<RegimenScalarWhereInput>
    NOT?: Enumerable<RegimenScalarWhereInput>
    id?: StringFilter | string
    title?: StringFilter | string
    description?: StringNullableFilter | string | null
    cadence?: StringFilter | string
    recurrenceType?: StringNullableFilter | string | null
    recurrenceDays?: StringNullableFilter | string | null
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    routineId?: StringFilter | string
  }

  export type RoutineCreateWithoutRegimensInput = {
    id?: string
    title: string
    description?: string | null
    category?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutRoutinesInput
  }

  export type RoutineUncheckedCreateWithoutRegimensInput = {
    id?: string
    title: string
    description?: string | null
    category?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type RoutineCreateOrConnectWithoutRegimensInput = {
    where: RoutineWhereUniqueInput
    create: XOR<RoutineCreateWithoutRegimensInput, RoutineUncheckedCreateWithoutRegimensInput>
  }

  export type TaskCreateWithoutRegimenInput = {
    id?: string
    title: string
    description?: string | null
    priority?: string
    status?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    dueDate?: Date | string | null
    dueLabel?: string | null
    dueBucket?: string | null
    completedAt?: Date | string | null
    referenceUrl?: string | null
    referenceLabel?: string | null
    referenceType?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUncheckedCreateWithoutRegimenInput = {
    id?: string
    title: string
    description?: string | null
    priority?: string
    status?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    dueDate?: Date | string | null
    dueLabel?: string | null
    dueBucket?: string | null
    completedAt?: Date | string | null
    referenceUrl?: string | null
    referenceLabel?: string | null
    referenceType?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskCreateOrConnectWithoutRegimenInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutRegimenInput, TaskUncheckedCreateWithoutRegimenInput>
  }

  export type RoutineUpsertWithoutRegimensInput = {
    update: XOR<RoutineUpdateWithoutRegimensInput, RoutineUncheckedUpdateWithoutRegimensInput>
    create: XOR<RoutineCreateWithoutRegimensInput, RoutineUncheckedCreateWithoutRegimensInput>
  }

  export type RoutineUpdateWithoutRegimensInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutRoutinesNestedInput
  }

  export type RoutineUncheckedUpdateWithoutRegimensInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskUpsertWithWhereUniqueWithoutRegimenInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutRegimenInput, TaskUncheckedUpdateWithoutRegimenInput>
    create: XOR<TaskCreateWithoutRegimenInput, TaskUncheckedCreateWithoutRegimenInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutRegimenInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutRegimenInput, TaskUncheckedUpdateWithoutRegimenInput>
  }

  export type TaskUpdateManyWithWhereWithoutRegimenInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutTasksInput>
  }

  export type TaskScalarWhereInput = {
    AND?: Enumerable<TaskScalarWhereInput>
    OR?: Enumerable<TaskScalarWhereInput>
    NOT?: Enumerable<TaskScalarWhereInput>
    id?: StringFilter | string
    title?: StringFilter | string
    description?: StringNullableFilter | string | null
    priority?: StringFilter | string
    status?: StringFilter | string
    recurrenceType?: StringNullableFilter | string | null
    recurrenceDays?: StringNullableFilter | string | null
    dueDate?: DateTimeNullableFilter | Date | string | null
    dueLabel?: StringNullableFilter | string | null
    dueBucket?: StringNullableFilter | string | null
    completedAt?: DateTimeNullableFilter | Date | string | null
    referenceUrl?: StringNullableFilter | string | null
    referenceLabel?: StringNullableFilter | string | null
    referenceType?: StringNullableFilter | string | null
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    regimenId?: StringFilter | string
  }

  export type RegimenCreateWithoutTasksInput = {
    id?: string
    title: string
    description?: string | null
    cadence?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    routine: RoutineCreateNestedOneWithoutRegimensInput
  }

  export type RegimenUncheckedCreateWithoutTasksInput = {
    id?: string
    title: string
    description?: string | null
    cadence?: string
    recurrenceType?: string | null
    recurrenceDays?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    routineId: string
  }

  export type RegimenCreateOrConnectWithoutTasksInput = {
    where: RegimenWhereUniqueInput
    create: XOR<RegimenCreateWithoutTasksInput, RegimenUncheckedCreateWithoutTasksInput>
  }

  export type RegimenUpsertWithoutTasksInput = {
    update: XOR<RegimenUpdateWithoutTasksInput, RegimenUncheckedUpdateWithoutTasksInput>
    create: XOR<RegimenCreateWithoutTasksInput, RegimenUncheckedCreateWithoutTasksInput>
  }

  export type RegimenUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routine?: RoutineUpdateOneRequiredWithoutRegimensNestedInput
  }

  export type RegimenUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routineId?: StringFieldUpdateOperationsInput | string
  }

  export type RoutineUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    regimens?: RegimenUpdateManyWithoutRoutineNestedInput
  }

  export type RoutineUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    regimens?: RegimenUncheckedUpdateManyWithoutRoutineNestedInput
  }

  export type RoutineUncheckedUpdateManyWithoutRoutinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RegimenUpdateWithoutRoutineInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUpdateManyWithoutRegimenNestedInput
  }

  export type RegimenUncheckedUpdateWithoutRoutineInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutRegimenNestedInput
  }

  export type RegimenUncheckedUpdateManyWithoutRegimensInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cadence?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUpdateWithoutRegimenInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dueLabel?: NullableStringFieldUpdateOperationsInput | string | null
    dueBucket?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    referenceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    referenceLabel?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateWithoutRegimenInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dueLabel?: NullableStringFieldUpdateOperationsInput | string | null
    dueBucket?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    referenceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    referenceLabel?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateManyWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    recurrenceType?: NullableStringFieldUpdateOperationsInput | string | null
    recurrenceDays?: NullableStringFieldUpdateOperationsInput | string | null
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dueLabel?: NullableStringFieldUpdateOperationsInput | string | null
    dueBucket?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    referenceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    referenceLabel?: NullableStringFieldUpdateOperationsInput | string | null
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}