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

    const expenses = await Expense
      .find({userId:req.user.id})
      .sort({date:-1});

    res.json(expenses);

  }catch(error){
    res.status(500).json(error);
  }
});


// ✏️ UPDATE EXPENSE (EDIT OPTION)
router.put("/:id", authMiddleware, async (req,res)=>{
  try{

    const {category,amount,note} = req.body;

    const updatedExpense = await Expense.findOneAndUpdate(
      {_id:req.params.id, userId:req.user.id},
      {category,amount,note},
      {new:true}
    );

    if(!updatedExpense){
      return res.status(404).json({message:"Expense not found"});
    }

    res.json(updatedExpense);

  }catch(error){
    res.status(500).json(error);
  }
});


// DELETE EXPENSE
router.delete("/:id", authMiddleware, async (req,res)=>{
  try{

    const deleted = await Expense.findOneAndDelete({
      _id:req.params.id,
      userId:req.user.id
    });

    if(!deleted){
      return res.status(404).json({message:"Expense not found"});
    }

    res.json({message:"Expense deleted"});

  }catch(error){
    res.status(500).json(error);
  }
});


module.exports = router;
