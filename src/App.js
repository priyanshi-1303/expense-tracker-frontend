import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import Auth from "./Auth";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [futurePrediction, setFuturePrediction] = useState(null);
  const [user, setUser] = useState(null);

  // 🔹 Add your Render backend URL here
  const BACKEND_URL = "https://expense-tracker-backend-q9it.onrender.com/"; // <-- replace with your actual URL

  // Firebase auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch expenses
  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/expenses`, {
        params: { userId: auth.currentUser.uid } // 🟢 send UID
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/expenses`, {
        title,
        amount: Number(amount),
        category,
        userId: auth.currentUser.uid // 🟢 save with UID
      });

      // Call AI analyze endpoint
      const aiRes = await axios.post(`${BACKEND_URL}/api/ai/analyze`, {
        category: category || "Other",
        current_spend: Number(amount),
      });

      if (aiRes.data.alert) {
        alert(aiRes.data.alert);
      }

      setTitle("");
      setAmount("");
      setCategory("Food");
      fetchExpenses();
    } catch (error) {
      console.error("❌ Error adding expense:", error.response?.data || error.message);
    }
  };

  const deleteExpense = async (id) => {
    await axios.delete(`${BACKEND_URL}/api/expenses/${id}`);
    fetchExpenses();
  };

  const getFuturePrediction = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/ai/predict_future`);
      setFuturePrediction(res.data.next_month_prediction);
    } catch (err) {
      console.error("❌ Prediction error", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Chart Colors
  const COLORS = ["#FFD700", "#FF4500", "#00CED1", "#32CD32", "#9370DB"];

  // Category-wise Data
  const categoryData = expenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, []);

  // Monthly Data (dummy for now)
  const monthlyData = [
    { month: "Jan", spend: 1200 },
    { month: "Feb", spend: 1500 },
    { month: "Mar", spend: 1700 },
    { month: "Apr", spend: 1600 },
    { month: "May", spend: 2000 },
    { month: "Jun", spend: 2100 },
  ];

  return (
    <div className="app-container">
      {!user ? (
        <Auth />
      ) : (
        <>
          {/* Header */}
          <header>
            <h1>💸 Smart Expense Tracker</h1>
            <p>Welcome, {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </header>

          {/* Form */}
          <form onSubmit={addExpense}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Select Category (or leave blank for AI) --</option>
              <option>Food</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Other</option>
            </select>
            <button type="submit">+ Add</button>
          </form>

          {/* Expense List */}
          <ul>
            {expenses.map((exp) => (
              <li key={exp._id}>
                <div>
                  <p>
                    <strong>{exp.title}</strong> - ₹{exp.amount}
                  </p>
                  <p>{exp.category}</p>
                </div>
                <button onClick={() => deleteExpense(exp._id)}>❌ Delete</button>
              </li>
            ))}
          </ul>

          {/* Future Prediction */}
          <div style={{ marginTop: "20px" }}>
            <button className="predict-btn" onClick={getFuturePrediction}>
              🔮 Predict Next Month Spend
            </button>
            {futurePrediction && (
              <p style={{ color: "yellow", marginTop: "10px" }}>
                📊 Estimated Next Month Spending: <b>₹{futurePrediction}</b>
              </p>
            )}
          </div>

          {/* Category Wise Pie Chart */}
          <div className="chart-section">
            <h2>📌 Spending by Category</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {/* Monthly Trend Line Chart */}
          <div className="chart-section">
            <h2>📈 Monthly Spending Trend</h2>
            <LineChart width={500} height={300} data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spend" stroke="#FFD700" />
            </LineChart>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
