<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id', 'date', 'check_in', 'check_out',
        'status', 'working_hours', 'notes', 'marked_by',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    protected $appends = ['formatted_date'];

    public function getFormattedDateAttribute()
    {
        return $this->date ? $this->date->format('d M Y') : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
