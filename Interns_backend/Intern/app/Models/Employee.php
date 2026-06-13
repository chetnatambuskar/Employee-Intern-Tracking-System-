<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'employee_id', 'department_id', 'designation',
        'joining_date', 'salary', 'employment_type', 'status',
        'address', 'emergency_contact', 'date_of_birth', 'gender',
    ];

    protected $casts = [
        'joining_date'   => 'date',
        'date_of_birth'  => 'date',
        'salary'         => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
