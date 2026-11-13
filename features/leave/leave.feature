@bdd
Feature: Leave Management

  Background:
    Given I am on the Leave List page

  @smoke
  Scenario: Leave list page loads successfully
    Then I should see the leave list page

  @regression
  Scenario: Leave list table displays header columns
    Then I should see leave type column in the table
    And I should see status column in the table

  @regression
  Scenario: Navigate to Apply Leave page
    When I navigate to the Apply Leave page
    Then I should be on the Apply Leave page

  @regression
  Scenario: Apply Leave page shows leave type dropdown
    When I navigate to the Apply Leave page
    Then I should see the leave type dropdown

  @regression
  Scenario: Navigate to My Leave List page
    When I navigate to the My Leave List page
    Then I should be on the My Leave List page

  @regression
  Scenario: Navigate to Leave Entitlements page
    When I navigate to the Leave Entitlements page
    Then I should be on the Leave Entitlements page
