@bdd
Feature: Recruitment Management

  Background:
    Given I am on the Job Vacancies page

  @smoke
  Scenario: Job vacancies page loads successfully
    Then I should see the vacancies page

  @smoke
  Scenario: Add Vacancy button is visible
    Then I should see the Add button

  @smoke
  Scenario: Navigate to Add Vacancy form
    When I click the Add button on the vacancies page
    Then I should see the Add Vacancy form

  @regression
  Scenario: Add Vacancy form has required fields
    When I click the Add button on the vacancies page
    Then I should see the job title dropdown
    And I should see the vacancy name input

  @regression
  Scenario: Validate required fields on Add Vacancy form
    When I click the Add button on the vacancies page
    And I submit the vacancy form without required fields
    Then I should see required field errors on the vacancy form

  @regression
  Scenario: Search vacancies by job title
    When I select a job title from the vacancy search dropdown
    And I click Search on the vacancies page
    Then I should see the vacancies results table

  @regression
  Scenario: Navigate to Candidates page
    When I navigate to the Candidates page
    Then I should see the Candidates page
