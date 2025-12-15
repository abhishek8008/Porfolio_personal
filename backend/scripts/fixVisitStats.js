const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

const fixVisitStats = async () => {
  try {
    console.log('🔧 Fixing visit_stats table...');

    // First, check if constraint already exists
    const checkConstraint = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'visit_stats' 
      AND constraint_type = 'UNIQUE'
    `);

    if (checkConstraint.rows.length > 0) {
      console.log('✅ UNIQUE constraint already exists');
    } else {
      // Clear any duplicate pages first (keep the one with highest visits)
      await db.query(`
        DELETE FROM visit_stats a
        USING visit_stats b
        WHERE a.id < b.id
        AND a.page = b.page
      `);
      console.log('✅ Cleared any duplicate pages');

      // Add UNIQUE constraint
      await db.query(`
        ALTER TABLE visit_stats 
        ADD CONSTRAINT visit_stats_page_unique UNIQUE (page)
      `);
      console.log('✅ Added UNIQUE constraint on page column');
    }

    console.log('\n🎉 visit_stats table fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing visit_stats:', error);
    process.exit(1);
  }
};

fixVisitStats();
