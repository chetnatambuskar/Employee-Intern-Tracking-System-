<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Intern extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'intern_id', 'department_id', 'college_name',
        'course', 'specialization', 'internship_start', 'internship_end',
        'status', 'stipend', 'skills', 'mentor_notes', 'performance_score',
    ];

    protected $casts = [
        'internship_start' => 'date',
        'internship_end'   => 'date',
        'skills'           => 'array',
        'stipend'          => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function placements()
    {
        return $this->hasMany(Placement::class);
    }
}
