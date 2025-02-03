import Task from "../models/task.js";
import User from '../models/user.js'; // Adjust the path if necessary
import { Sequelize } from 'sequelize'; 
export const createTask = async (req, res) => {
    try {
      // Match these field names with those in your Task model (case-sensitive)
      const { 
        main_title, 
        sub_title, 
        description, 
        assigned_to, 
        duration, 
        day_period, 
        status, 
        ending_date, 
        comments, 
        is_archive 
      } = req.body;
  
      // Create a new task using the Sequelize model
      const newTask = await Task.create({
        main_title,
        sub_title,
        description,
        assigned_to,
        duration,
        day_period,
        status,
        ending_date,
        comments,
        is_archive,
        
      });
  
      res.status(201).json({
        message: "Task saved successfully",
        task: newTask,
      });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  // Get all Tasks
//   export const getAllTasks = async (req, res) => {
//     try {
//       const tasks = await Task.findAll({
//         where: {
//             is_archive: false, 
//           },
//         include: [
//           {
//             model: User, // Reference to the User model
//             as: 'User', // Alias for the relationship (optional but recommended)
//             attributes: ['username'], // Specify the fields you want to include from the User table
//           },
//         ],
//       });
//       res.status(200).json(tasks);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };
export const getAllTasks = async (req, res) => {
    try {
      const tasks = await Task.findAll({
        where: {
          is_archive: false,
        },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['username'],
          },
        ],
       
        attributes: {
          include: [
            [
              Sequelize.literal(
                `DATE_PART('day', CURRENT_DATE::date - DATE_TRUNC('day', "Task"."create_date"::date))`
            ),
              'days_since_creation', 
            ],
          ],
        }, order: [['id', 'ASC']], 
      });
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  // Get a single Task by ID
  export const getTaskById = async (req, res) => {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.status(200).json(task);
    } catch (error) {
      console.error("Error fetching task by ID:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  // Update a Task
  export const updateTask = async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        main_title, 
        sub_title, 
        description, 
        assigned_to, 
        duration, 
        day_period, 
        status, 
        ending_date, 
        comments, 
        is_archive 
      } = req.body;

      const task = await Task.findByPk(id);
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Update task fields
      task.main_title = main_title || task.main_title;
      task.sub_title = sub_title || task.sub_title;
      task.description = description || task.description;
      task.assigned_to = assigned_to || task.assigned_to;
      task.duration = duration || task.duration;
      task.day_period = day_period || task.day_period;
      task.status = status || task.status;
      task.ending_date = ending_date || task.ending_date;
      task.comments = comments || task.comments;
      task.is_archive = is_archive || task.is_archive;
  
      await task.save();
  
      res.status(200).json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  // Delete a Task
  export const deleteTask = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("id = "+ id)
      const task = await Task.findByPk(id);
      console.log("task = "+ task)
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      await task.destroy();
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  export const archiveTask = async (req, res) => {
    try {
      const { id } = req.params; // Get the task ID from the request parameters
  
      const task = await Task.findByPk(id); // Find the task by primary key (ID)
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" }); // Return 404 if task doesn't exist
      }
  
      task.is_archive = true; // Set is_archive to true
      await task.save(); // Save the updated task
  
      res.status(200).json({ message: "Task archived successfully", task }); // Respond with success message
    } catch (error) {
      console.error("Error archiving task:", error);
      res.status(500).json({ message: "Internal Server Error" }); // Handle errors
    }
  };
  

//   export const getAllArchiveTasks = async (req, res) => {
//     try {
//       const tasks = await Task.findAll({
//         where: {
//             is_archive: true, 
//           },
//         include: [
//           {
//             model: User, // Reference to the User model
//             as: 'User', // Alias for the relationship (optional but recommended)
//             attributes: ['username'], // Specify the fields you want to include from the User table
//           },
//         ],
//       });
//       res.status(200).json(tasks);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;  // Extract task ID from the request parameters

    // Find the task by ID
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task's status to "completed"
    task.status = "completed";
    await task.save();  // Save the updated task back to the database

    // Return a success response
    res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


  
export const getAllArchiveTasks = async (req, res) => {
    try {
      const tasks = await Task.findAll({
        where: {
          is_archive: true, // Fetch archived tasks
        },
        include: [
          {
            model: User, // Reference to the User model
            as: 'User', // Alias for the relationship (optional but recommended)
            attributes: ['username'], // Specify the fields you want to include from the User table
          },
        ],
        
        // Add a computed column to calculate the number of days from created_date
        attributes: {
          include: [
            [
              Sequelize.literal(
                `DATE_PART('day', CURRENT_DATE::date - DATE_TRUNC('day', "Task"."create_date"::date))`
            ),
              'days_since_creation', // This will return the number of days from creation date
            ],
          ],
        },
      });
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };