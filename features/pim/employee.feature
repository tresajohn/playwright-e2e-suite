@bdd
Feature: Employee Management (PIM)

  Background:
    Given I am on the Employee List page

  @smoke
  Scenario: Employee list page loads successfully
    Then I should see the employee list table

  @smoke
  Scenario: Navigate to Add Employee page
    When I click the Add button on the employee list
    Then I should be on the Add Employee page

  @regression
  Scenario: Search for an employee by name
    When I search for employee by name "John"
    Then I should see employee search results

  @regression
  Scenario: Search returns no results for unknown employee
    When I search for employee by name "ZZZNonExistentEmployee999"
    Then I should see the no records found message

  @regression
  Scenario: Reset clears the search filters
    When I search for employee by name "John"
    And I click the Reset button
    Then the employee name search field should be empty

  @regression
  Scenario: Add a new employee and verify save
    When I click the Add button on the employee list
    And I fill in first name "BDD" middle name "Test" last name "Employee"
    And I click Save on the employee form
    Then the employee record should be saved

  @regression
  Scenario: Validate required fields on Add Employee form
    When I click the Add button on the employee list
    And I clear the first name and last name fields
    And I click Save on the employee form
    Then I should see required field errors on the employee form
