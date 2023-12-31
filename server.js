const mysql = require('mysql');
const inquirer = require('inquirer');
require('console.table');
//mysql connection
const connection = mysql.createConnection({
    host: 'localhost',

    //PORT
    port: 3306,

    // Your username
    user: 'root',

    // Your password
    password: 'Rockleespirit09!',
    database: 'employees_db'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id' + connection.threadId);
    console.log(` ╔═══╗─────╔╗──────────────╔═╗╔═╗
    ║╔══╝─────║║──────────────║║╚╝║║
    ║╚══╦╗╔╦══╣║╔══╦╗─╔╦══╦══╗║╔╗╔╗╠══╦═╗╔══╦══╦══╦═╗
    ║╔══╣╚╝║╔╗║║║╔╗║║─║║║═╣║═╣║║║║║║╔╗║╔╗╣╔╗║╔╗║║═╣╔╝
    ║╚══╣║║║╚╝║╚╣╚╝║╚═╝║║═╣║═╣║║║║║║╔╗║║║║╔╗║╚╝║║═╣║
    ╚═══╩╩╩╣╔═╩═╩══╩═╗╔╩══╩══╝╚╝╚╝╚╩╝╚╩╝╚╩╝╚╩═╗╠══╩╝
    ───────║║──────╔═╝║─────────────────────╔═╝║
    ───────╚╝──────╚══╝─────────────────────╚══╝`)
    firstPrompt();

  });
// function for inquirer to get prompts 
function firstPrompt() {

    inquirer
      .prompt({
        type: "list",
        name: "task",
        message: "What would you like to do?",
        choices: [
          "View Employees",
          "View Employees by Department",
          "Add Employee",
          "Remove Employees",
          "Update Employee Role",
          "Add Role",
          "Add a new Department",
          "End"]
      })
      .then(function ({ task }) {
        switch (task) {
          case "View Employees":
            viewEmployee();
            break;
  
          case "View Employees by Department":
            viewEmployeesByDepartment();
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

          case "Add a new Department":
            addDepartment();
            break;
          case "End":
            connection.end();
            break;
        }
      });
  }

  // View Employees
  function viewEmployee() {
    console.log('Viewing employees');

    var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, '',m.last_name) AS manager
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
    `SELECT d.id, d.name, MAX(r.salary) AS max_salary
    FROM employee e
    LEFT JOIN role r
        ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
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

    function promptDepartment(departmentChoices) {
    
        inquirer
        .prompt([
    {
        type: 'list',
        name: 'departmentId',
        message: "Which department do you choose",
        choices: departmentChoices
    }
    ])
    .then(function (answer) {
        console.log('answer ',answer.departmentId);

        var query =
        `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  WHERE d.id = ?`

      connection.query(query, answer.departmentId, function (err, res) {
        if (err) throw err;

        console.table("response ", res);
        console.log(res.affectedRows + "Employees Viewed!\n");

        firstPrompt();
      });
    });
    }

    // Create a employee array
function addEmployee() {
    console.log("Inserting an employee!")
  
    var query =
      `SELECT r.id, r.title, r.salary 
        FROM role r`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      const roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`
      }));
  
      console.table(res);
      console.log("RoleToInsert!");
  
      promptInsert(roleChoices);
    });
  }

  function promptInsert(roleChoices) {

    inquirer
      .prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?"
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "roleId",
          message: "What is the employee's role?",
          choices: roleChoices
        },
        {
          type: "input",
          name: "managerId",
          message: "What is the employee's manager's ID?"
        },
      ])
      .then(function (answer) {
        console.log(answer);
  
        var query = `INSERT INTO employee SET ?`
        // when finished prompting, insert a new item into the db with that info
        connection.query(query,
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: answer.roleId,
            manager_id: answer.managerId,
          },
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log("Inserted successfully!\n");
  
            firstPrompt();
          });
      });
  }

  // Make a employee array to delete
function removeEmployees() {
    console.log("Deleting an employee");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name
        FROM employee e`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${id} ${first_name} ${last_name}`
      }));
  
      console.table(res);
      console.log("ArrayToDelete!\n");
  
      promptDelete(deleteEmployeeChoices);
    });
  }

  function promptDelete(deleteEmployeeChoices) {

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to remove?",
          choices: deleteEmployeeChoices
        }
      ])
      .then(function (answer) {
  
        var query = `DELETE FROM employee WHERE ?`;
        // when finished prompting, insert a new item into the db with that info
        connection.query(query, { id: answer.employeeId }, function (err, res) {
          if (err) throw err;
  
          console.table(res);
          console.log(res.affectedRows + "Deleted!\n");
  
          firstPrompt();
        });
      });
  }

  //"Update Employee Role" / UPDATE,
function updateEmployeeRole() { 
    employeeArray();
  
  }
  
  function employeeArray() {
    console.log("Updating an employee");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    JOIN employee m
      ON m.id = e.manager_id`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      const employeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${first_name} ${last_name}`      
      }));
  
      console.table(res);
      console.log("employeeArray To Update!\n")
  
      roleArray(employeeChoices);
    });
  }
  
  function roleArray(employeeChoices) {
    console.log("Updating an role");
  
    var query =
      `SELECT r.id, r.title, r.salary 
    FROM role r`
    let roleChoices;
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
      }));
  
      console.table(res);
      console.log("roleArray to Update!\n")
  
      promptEmployeeRole(employeeChoices, roleChoices);
    });
  }
  
  function promptEmployeeRole(employeeChoices, roleChoices) {
  
    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to set with the role?",
          choices: employeeChoices
        },
        {
          type: "list",
          name: "roleId",
          message: "Which role do you want to update?",
          choices: roleChoices
        },
      ])
      .then(function (answer) {
  
        var query = `UPDATE employee SET role_id = ? WHERE id = ?`
        // when finished prompting, insert a new item into the db with that info
        connection.query(query,
          [ answer.roleId,  
            answer.employeeId
          ],
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log(res.affectedRows + "Updated successfully!");
  
            firstPrompt();
          });
      });
  }
  
  
  
  //"Add Role" / CREATE: INSERT INTO
  function addRole() {
  
    var query =
      `SELECT d.id, d.name, MAX(r.salary) AS max_salary
      FROM employee e
      JOIN role r
      ON e.role_id = r.id
      JOIN department d
      ON d.id = r.department_id
      GROUP BY d.id, d.name`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      // (callback: (value: T, index: number, array: readonly T[]) => U, thisArg?: any)
      const departmentChoices = res.map(({ id, name }) => ({
        value: id, name: `${id} ${name}`
      }));

  
      console.table(res);
      console.log("Department array!");
  
      promptAddRole(departmentChoices);
    });
  }
  
  function promptAddRole(departmentChoices) {
  
    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "Role title?"
        },
        {
          type: "input",
          name: "roleSalary",
          message: "Role Salary"
        },
        {
          type: "list",
          name: "departmentId",
          message: "Department?",
          choices: departmentChoices
        },
      ])
      .then(function (answer) {
  
        var query = `INSERT INTO role SET ?`
  
        connection.query(query, {
          title: answer.roleTitle,
          salary: answer.roleSalary,
          department_id: answer.departmentId
        },
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log("Role Inserted!");
  
            firstPrompt();
          });
  
      });

  }
  function addDepartment(departmentChoices) {
    inquirer
      .prompt([
        {
          type: "input",
          name: "departmentName",
          message: "Enter the name of the new department:",
        }
      ])
      .then(function (answer) {
        // Insert the new department into the database
        var query = "INSERT INTO department (name) VALUES (?)";
        connection.query(query, [answer.departmentName], function (err, res) {
          if (err) throw err;
          console.log(`New department "${answer.departmentName}" added successfully!\n`);
          firstPrompt(); // Return to the main menu
        });
      });

      
}
