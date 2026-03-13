const express = require("express");
const router = express.Router();

const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");


// ADD EXPENSE
router.post("/", authMiddleware, async (req,res)=>{
  try{

    const {category,amount,note} = req.body;

    const expense = new Expense({
      userId:req.user.id,
      category,
      amount,
      note
    });

    await expense.save();

    res.json(expense);

  }catch(error){
    res.status(500).json(error);
  }
});


// GET ALL EXPENSES
router.get("/", authMiddleware, async (req,res)=>{
  try{

    const expenses = await Expense.find({userId:req.user.id}).sort({date:-1});

    res.json(expenses);

  }catch(error){
    res.status(500).json(error);
  }
});


// DELETE EXPENSE
router.delete("/:id", authMiddleware, async (req,res)=>{
  try{

    await Expense.findByIdAndDelete(req.params.id);

    res.json({message:"Expense deleted"});

  }catch(error){
    res.status(500).json(error);
  }
});

module.exports = router;