import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import ReceiptUpload from "./pages/ReceiptUpload";
import ImportCSV from "./pages/Import";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LandingPage from "./pages/Landingpage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/add" element={<AddExpense />} />
        <Route path="/expenses/receipt" element={<ReceiptUpload />} />
        <Route path="/expenses/import" element={<ImportCSV />} />
        <Route path="/recurring" element={<Recurring />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;