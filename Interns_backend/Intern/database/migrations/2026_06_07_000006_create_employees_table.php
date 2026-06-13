<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('employee_id')->unique();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('designation');
            $table->date('joining_date');
            $table->decimal('salary', 10, 2)->default(0);
            $table->enum('employment_type', ['full_time','part_time','contract'])->default('full_time');
            $table->enum('status', ['active','inactive','terminated','on_leave'])->default('active');
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male','female','other'])->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
