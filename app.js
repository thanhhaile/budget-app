// -------------------- BUDGET CONTROLLER --------------
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;        
    };

    Expense.prototype.calcPercentages = function(totalIncom) {
        if (totalIncom > 0) {
            this.percentage = Math.round((this.value / totalIncom) * 100);
        } else {
            this.percentage = -1;   
        }
    };

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;        
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        
        allItems: {
            inc: [],
            exp: []
        },

        totals: {
            inc: 0,
            exp: 0
        },

        budget: 0,
        percentage: -1,

    };

    return {
        addItem: function(type, des, value) {
            var newItem, ID;

            // create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new Item based on type is 'inc' or 'exp'
            if(type === 'inc') {

                newItem = new Income(ID, des, value);

            } else if (type === 'exp') {

                newItem = new Expense(ID, des, value);

            }

            // push new Item into our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id) {

            var ids, index;

            ids = data.allItems[type].map(function(cur) {

                return cur.id;

            });

            index = ids.indexOf(id);

            if( index !== -1 ) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals.inc);
            })

        },

        getPercentages: function() {
            var allPerc;

            allPerc = data.allItems.exp.map(function(cur, index) {
                
                return cur.getPercentages();

            });

            return allPerc;
        },

        getBudget: function() {
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data)
        }
    
    }

})();


//-------------------- UI CONTROLLER --------------
var UIController = (function() {

    // giup quan ly cac ten the DOM va thay doi nhanh chong khi can thiet
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function(num, type) {

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {

            var addComma = 0, amount = 3;
            for (var i = 3; i < int.length; i += amount) {

                int = int.substr(0, int.length - i) + ',' + int.substr(int.length - i, i);
                addComma = 1 ;
                amount = 3 + addComma;
                        
            }

        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
                
        for(var i = 0; i < list.length; i++) {
            callback( list[i], i );
        }

    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }

        },

        addListItem: function (obj, type) {
        
            var html, newHtml, element;
    
            // 1. Create HTML string with placeholder text
            if ( type === 'inc') {

                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    
            } else if ( type === 'exp') {
    
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
    
            // 2. Replace placeholder text with somw actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
    
            // 3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields, fieldsArr;

            // select all element fields
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // convert type form List to Array 
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value ='';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensePercLabel);
            

            nodeListForEach(fields, function(current, index) {

                if ( percentages[index] > 0 ) {
                    
                    current.textContent = percentages[index] + '%';
                    
                } else {
                    
                    current.textContent = '---';
                }
            });

        },   
        
        displayMonth: function() {

            var now, year, month, months, day;

            now = new Date();

            date = now.getDate();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = date + ' ' + months[month] + ' ' + year;

        },

        changeType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;            
        },
        
    }

})();


// -------------------- GLOBAL APP CONTROLLER --------------------
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    updateBudget = function() {
        var budget;

        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        budget = budgetCtrl.getBudget();

        // 3. display the budget on UI
        UICtrl.displayBudget(budget);

    };

    updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };


    var ctrlAddItem = function() {

        var input, newItem;

        // 1. get the field input data
        input = UICtrl.getInput();      
        
        if (input.description !== '' && !isNaN(input.value) && input.value > 0){
            
            // 2. add the item to the budget data
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);
    
            // 4. Clear the field input
            UICtrl.clearFields();   
            
            // 5. Calculate the update budget
            updateBudget();

            // 6. Calculate the updata percentages
            updatePercentages();

        }        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update & show the new budget
            updateBudget();

            // 4. Calculate the updata percentages
            updatePercentages();

        }

    }

    return {
        init: function() {
            console.log('App was started.');

            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();