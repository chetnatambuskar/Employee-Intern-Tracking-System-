<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $fillable = [
        'user_id', 'file_name', 'file_path', 'file_type', 'file_size', 'is_primary',
    ];

    protected $casts = ['is_primary' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
