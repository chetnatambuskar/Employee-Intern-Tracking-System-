<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('placements', function (Blueprint $table) {
            $table->decimal('package_lpa', 10, 2)->change();
        });
    }

    public function down(): void
    {
        Schema::table('placements', function (Blueprint $table) {
            $table->decimal('package_lpa', 6, 2)->change();
        });
    }
};
