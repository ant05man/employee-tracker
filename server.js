const mysql = require('mysql');
const inquirer = require('inquirer');

//mysql connection
const connection = mysql.createConnection({
    host: 'localhost',

    //PORT
    port: 3001,

    // Your username
    user: 'root',

    // Your password
    password: '',
    database: 'employees_db'
},
console.log('Connected to employees_db database')
);

// function for inquirer to get prompts 
function firstPrompt() {

    inquirer
      .prompt({
        type: "list",
        name: "task",
        message: "Would you like to do?",
        choices: [
          "View Employees",
          "View Employees by Department",
          "Add Employee",
          "Remove Employees",
          "Update Employee Role",
          "Add Role",
          "End"]
      })
      .then(function ({ task }) {
        switch (task) {
          case "View Employees":
            viewEmployee();
            break;
  
          case "View Employees by Department":
            viewEmployeeByDepartment();
            break;
        
          case "Add Employee":
            addEmployee();
            break;
  
          case "Remove Employees":
            removeEmployees();
            break;
  
          case "Update Employee Role":
            updateEmployeeRole();
            break;
  
          case "Add Role":
            addRole();
            break;
  
          case "End":
            connection.end();
            break;
        }
      });
  }

  // View Employees
  function viewEmployee() {
    console.log('Viewing employeess');

    var query =
    `SELECT e.id e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, '',m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee m
      ON m.id = e.manager_id`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      console.table(res);
      console.log("Employees viewed!\n");
  
      firstPrompt();
    });
  
  } 

// View Employees by Department

function viewEmployeesByDepartment() {
    console.log('Viewing employees by Department\n');

    var query =
    `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    LEFT JOIN role r
        ON e.role_id = r.id
    LEFT JOIN department_id
    GROUP BY d.id, d.name`

    connection.query(query, function (err,res) {
        if (err) throw err;
    
        const departmentChoices = res.map(data => ({
            value: data.id, name: data.name
        }));
        console.log("Department View\n");

        promptDepartment(departmentChoices);
    });
    }