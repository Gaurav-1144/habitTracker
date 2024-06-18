const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/habitTrackerDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Set up EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Define the Habit schema and model
const habitSchema = new mongoose.Schema({
  name: String,
  status: { type: Map, of: String }
});

const Habit = mongoose.model('Habit', habitSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({});
    res.render('index', { habits: habits });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving habits");
  }
});

app.post('/add', async (req, res) => {
  const habitName = req.body.habitName;
  const newHabit = new Habit({
    name: habitName,
    status: new Map()
  });

  try {
    await newHabit.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding new habit");
  }
});

app.post('/update', async (req, res) => {
  const { habitId, date, status } = req.body;

  try {
    const habit = await Habit.findById(habitId);
    if (habit) {
      habit.status.set(date, status);
      await habit.save();
      res.redirect('/');
    } else {
      res.status(404).send("Habit not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating habit");
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
