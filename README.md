# WealthWise - Personal Finance Management Application

WealthWise is a modern, full-stack personal finance management application that helps users track their expenses, manage budgets, and gain insights into their financial health. Built with cutting-edge technologies and a focus on user experience, WealthWise provides a comprehensive solution for personal financial management.

## 🌟 Features

- 📊 Interactive dashboard with financial overview
- 💰 Expense tracking and categorization
- 📱 Responsive design for all devices
- 🔒 Secure user authentication

## 🚀 Live Demo

[View Live Application](https://wealthwise-0s8x.onrender.com/)

## 🛠️ Technologies Used

### Frontend
- React with TypeScript
- Vite for build tooling
- Material-UI (MUI) for styling and components
- React Router for navigation
- Apollo Client for GraphQL data fetching

### Backend
- Node.js with TypeScript
- Express.js framework
- MongoDB database with Mongoose ODM
- GraphQL with Apollo Server
- JWT for authentication

### Development Tools
- pnpm for package management
- ESLint for code linting
- TypeScript for type safety
- Git for version control

## 🏗️ Project Structure

```
wealthwise/
├── client/               # Frontend React application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── server/               # Backend Node.js application
│   ├── src/              # Source code
│   └── package.json      # Backend dependencies
└── package.json          # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10.5.2 or higher)
- MongoDB database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/LeviOP/wealthwise.git
cd wealthwise
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp server/.example.env server/.env
# Edit server/.env with your database credentials
```

4. Start the development servers:
```bash
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🤝 Support

For support, please open an issue in the GitHub repository or contact the maintainers.