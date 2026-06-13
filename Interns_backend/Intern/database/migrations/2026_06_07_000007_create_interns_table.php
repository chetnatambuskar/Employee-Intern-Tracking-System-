<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('interns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('intern_id')->unique();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('college_name');
            $table->string('course');
            $table->string('specialization')->nullable();
            $table->date('internship_start');
            $table->date('internship_end');
            $table->enum('status', ['active','completed','terminated','placed'])->default('active');
            $table->decimal('stipend', 8, 2)->default(0);
            $table->json('skills')->nullable();
            $table->text('mentor_notes')->nullable();
            $table->integer('performance_score')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interns');
    }
};
