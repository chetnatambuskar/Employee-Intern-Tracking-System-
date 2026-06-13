<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intern_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('job_role');
            $table->decimal('package_lpa', 6, 2)->nullable();
            $table->date('offer_date');
            $table->date('joining_date')->nullable();
            $table->enum('placement_type', ['full_time', 'part_time', 'contract', 'ppo'])->default('full_time');
            $table->enum('status', ['offered', 'accepted', 'rejected', 'joined'])->default('offered');
            $table->string('offer_letter')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('placements');
    }
};
