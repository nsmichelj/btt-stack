# create-btt-stack

An interactive CLI to initialize a Next.js project with a better, faster, and modern stack of tools

## What is BTT Stack?

BTT Stack (Better Tech Toolkit) is a modern web development stack that combines the best tools to build scalable and maintainable web applications. It is composed of:

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://better-auth.com/)

## What is `create-btt-stack`?

`create-btt-stack` is a command-line tool designed to generate projects based on the BTT Stack.

This is NOT an all-inclusive template. It is a modular base that allows you to choose the tools you need to build your application.

### What does it do?

- Generates a Next.js project with an organized structure from the start
- Automatically configures the selected tools
- Adjusts key files (tsconfig, aliases, environment configuration, etc.)
- Allows you to choose what to include (auth, database, etc.)
- Avoids repetitive and error-prone configurations

### Focus

The CLI follows a modular approach:

- You can include only what you need
- It doesn't force unnecessary decisions
- Maintains consistency in the structure without being restrictive

The result is a project ready to start developing.

## Get Started

Run the following command to create a new project and follow the interactive prompts:

### npm

```bash
npm create btt-stack@latest
```

### pnpm

```bash
pnpm create btt-stack@latest
```

### yarn

```bash
yarn create btt-stack@latest
```

### bun

```bash
bun create btt-stack@latest
```

## Contributing

Contributions are welcome!

## License

This project is under the [MIT](LICENSE) license.
