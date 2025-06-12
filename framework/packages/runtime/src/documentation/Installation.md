## Step 1: Clone the Repository

![Installation](https://img.shields.io/badge/Installation-guide-blue)


Clone the DotJS framework repository to your local machine using Git:

```bash
git clone https://gitea.kood.tech/karlrometsomelar/frontend-framework
cd frontend-framework
```

## Step 2: Install Framework Dependencies

The DotJS framework is organized as a monorepo with multiple packages, including the `runtime` package. To install the framework dependencies:

1. Navigate to the framework directory:

   ```bash
   cd framework
   ```

2. Install dependencies for all packages in the monorepo:

   ```bash
   npm install
   ```

   This installs dependencies for the `runtime`, `compiler`, and `loader` packages, as defined in `framework/package.json`.

3. Build the framework:

   ```bash
   npm run build --workspace=packages/runtime
   ```

   This command uses Rollup to bundle the framework's runtime into `framework/packages/runtime/dist/fe-fwk.js`, as specified in the `packages/runtime/package.json`.

## Step 3: Set Up the Example Todo Application

The example Todo application demonstrates how to use the DotJS framework with a Java Spring Boot backend and a PostgreSQL database. Follow these steps to set it up:

### 3.1: Configure the Backend

1. **Navigate to the Backend Directory**:

   ```bash
   cd example/backend
   ```

2. **Install Backend Dependencies**:
    - The backend uses Maven for dependency management. Ensure Maven is installed or use the Maven Wrapper included in the project:

      ```bash
      ./mvnw install
      ```

3. **Run the Backend**:
    - Start the Spring Boot application:

      ```bash
      ./mvnw spring-boot:run
      ```

      The backend will run on `http://localhost:8080`, as configured in `application.properties`.

### 3.2: Configure the Frontend

1. **Navigate to the Frontend Directory**:

   ```bash
   cd ../frontend
   ```

2. **Install Frontend Dependencies**:
    - Install the dependencies listed in `example/frontend/package.json`:

      ```bash
      npm install
      ```

3. **Link the Framework**:
    - To use the locally built DotJS framework in the example app, link the framework package:

      ```bash
      cd ../../framework/packages/runtime
      npm link
      cd ../../../example/frontend
      npm link frontend-framework
      ```

      This links the `frontend-framework` package (from `framework/packages/runtime`) to the example app.

4. **Run the Frontend**:
    - Start the development server using Webpack:

      ```bash
      npm run dev
      ```

      This command uses `webpack.dev.js` to start a development server on `http://localhost:3000`. The server supports hot reloading and opens the app in your default browser.

## Step 4: Verify the Setup

1. Open your browser and navigate to http://localhost:3000.
2. You should see the Todo application's interface, titled "Blind Dating App Team TODO Task List," as defined in `example/frontend/webpack.common.js`.
3. Interact with the app to ensure it communicates with the backend at `http://localhost:8080`. For example, try adding or retrieving Todo items to verify the connection.


## Troubleshooting

- **Database Connection Issues**:
   - Ensure PostgreSQL is running and the `frameworktodoappdb` database exists.
   - Verify the username and password in `example/backend/src/main/resources/application.properties` match your PostgreSQL setup.
- **Port Conflicts**:
   - If port `8080` (backend) or `3000` (frontend) is in use, update `server.port` in `application.properties` or the `port` in `webpack.dev.js`, respectively.
- **Module Not Found Errors**:
   - Ensure `npm link` was executed correctly to link the framework.
   - Run `npm install` again in the `example/frontend` directory if dependencies are missing.
- **Build Issues**:
   - Verify that Rollup built the framework successfully by checking for `framework/packages/runtime/dist/fe-fwk.js`.
   - Run `npm run lint` in `framework/packages/runtime` to check for code issues.

## Next Steps

- Explore the example Todo app's code in `example/frontend/src/js/app.js` to understand how the DotJS framework is integrated.
- Refer to the [Framework Documentation](../../../../../README.md) for details on building components and leveraging the framework's features.
- Modify the example app or create a new project using the DotJS framework to suit your needs.
