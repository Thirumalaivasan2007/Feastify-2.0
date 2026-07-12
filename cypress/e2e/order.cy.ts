describe('Feastify Ordering Flow', () => {
    it('should successfully log in and place an order', () => {
        // Visit the home page
        cy.visit('http://localhost:3000');

        // Login as customer
        cy.contains('Login').click();
        cy.get('input[type="email"]').type('customer@feastify.com');
        cy.get('input[type="password"]').type('password');
        cy.contains('Sign In').click();

        // Navigate to Menu
        cy.visit('http://localhost:3000/menu');

        // Add first item to cart
        cy.get('.glass-card').first().contains('Add').click();

        // Go to Cart
        cy.visit('http://localhost:3000/cart');

        // Place Order
        cy.contains('Proceed to Checkout').click();
        
        // Assert Order Success
        cy.contains('Order placed successfully!').should('be.visible');
        cy.url().should('include', '/orders');
    });

    it('should show new order in admin dashboard', () => {
        // Login as admin
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('input[type="email"]').type('admin@feastify.com');
        cy.get('input[type="password"]').type('password');
        cy.contains('Sign In').click();

        // Navigate to Admin Dashboard
        cy.visit('http://localhost:3000/admin');
        
        // Ensure Orders tab is selected and there is at least one order
        cy.contains('Orders').click();
        cy.get('.glass-card').should('have.length.at.least', 1);
    });
});
